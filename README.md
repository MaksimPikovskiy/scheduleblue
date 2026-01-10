# ScheduleBlue - Message Scheduler

A full-stack monorepo application for scheduling and sending messages (with ability to integrate iMessages AppleScript or Sendblue API endpoints). This project consists of a browser UI for scheduling messages, a backend that processes messages in a FIFO queue, and a mock gateway component (replaceable with AppleScript or Sendblue API).

## Project Structure

```
scheduleblue/
├── .devcontainer      # Docker config for coding inside a container
├── frontend/          # Next.js+TailwindCSS frontend for scheduling 
├── backend/           # Express+Prisma backend with queue processor
├── gateway/           # mock gateway component
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database and set the connection string:

```bash
createdb imessage_scheduler # create psql database
# Create a .env file in the backend directory
cd backend
cp .env.example .env  # or create .env manually
```

Add your database URL to `backend/.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/imessage_scheduler"
PORT="8080"
MESSAGES_PER_HOUR="1"
ACCEPTED_STATUS_PERMANENCE_MS="5000" # in milliseconds
API_BASE_URL="http://localhost:8080/api"
```

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

The backend will start on `http://localhost:8080` (or the port specified in `.env`).

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Then start the development server:

```bash
npm run dev
```

The frontend will start on [`http://localhost:3000`](http://localhost:3000).

### 4. Gateway Setup

The gateway component is a Node.js script located in `gateway/send-message.js`. It is automatically called by the backend queue processor.

**Note:** The current implementation simulates message sending rather than actually sending it.

We have 2 options to be able to send iMessages:

- If running on a Macbook with active iMessages, one can create an `AppleScript` for queueProcessor to execute.

  In `queueProcessor.ts`, instead of

  ```javascript
  const gatewayPath = path.join(__dirname, "../../gateway/send-message.js");
  const gatewayProcess = spawn("node", [gatewayPath, messageId, to, body]);
  ```

  We do

  ```javascript
  const scriptPath = path.join(
    __dirname,
    "../../gateway/send-message.applescript"
  );
  const gatewayProcess = spawn("osascript", [scriptPath, messageId, to, body]);
  ```

  Example AppleScript integration (for macOS with active iMessages):

  ```applescript
  on run {messageId, targetPhone, messageBody}
  try
     tell application "Messages"
        set targetService to first service whose service type = iMessage
        set targetBuddy to buddy targetPhone of targetService
        send messageBody to targetBuddy
     end tell

     return "{ \"messageId\": \"" & messageId & "\", \"status\": \"SENT\" }"

  on error errMsg
     return "{ \"messageId\": \"" & messageId & "\", \"status\": \"FAILED\", \"error\": \"" & errMsg & "\" }"
  end try
  end run
  ```

- The second option would be using `Sendblue` integration
  - The `queueProcessor` will call on `send-message` API endpoint to send iMessages.
  - It can then spawn a process to check on the `status_callback` POST URL until the status is DELIVERED.

## Running the Project

1. **Start the database** (if running locally):

   ```bash
   # Start postgresql services if not started
   # MacOS
   brew services start postgresql
   # Linux
   sudo service postgresql start
   # Windows (CMD in Admin)
   net start postgresql-x64-15

   ```

2. **Start the backend**:

   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the application**:
   - Home: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard

## How It Works

1. **Scheduling**: Users enter a phone number and message in the browser UI. Phone numbers are validated in real-time and automatically formatted to E.164 format (e.g., `+15551234567`). Valid messages are created with status `QUEUED` in the database.

2. **Queue Processing**: The backend queue processor runs continuously, checking for `QUEUED` messages in FIFO order (oldest first).

3. **Message Sending**: When a message is found:

   - Status is updated to `ACCEPTED`
   - The gateway component is called to send the message
   - Status is updated based on the gateway response (`SENT`, `DELIVERED`, or `FAILED`)

4. **Rate Limiting**: Messages are processed at a configurable rate (default: 1 per hour). Set `MESSAGES_PER_HOUR` in the backend `.env` to change this.

5. **Status Tracking**: Messages progress through statuses:
   - `QUEUED` → `ACCEPTED` → `SENT` or `DELIVERED` (or `FAILED`)

## API Endpoints

- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create a new message

  ```json
  {
    "to": "+15551234567",
    "body": "Your message here"
  }
  ```

  **Note:** The `to` field must be a valid international phone number. It will be automatically formatted to E.164 format (e.g., `+15551234567` or `+442071234567`). Phone number validation is performed on both frontend and backend using `libphonenumber-js`.

- `GET /api/messages/next_message` - Get next message in FIFO queue
- `PATCH /api/messages/:id/status` - Update status of the message
  ```json
  {
    "status": "ACCEPTED"
  }
  ```
- `GET /api/health` - Health check

## Configuration

### Backend Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 8080)
- `MESSAGES_PER_HOUR` - Number of messages to process per hour (default: 1)
- `ACCEPTED_STATUS_PERMANENCE_MS` - Time to keep ACCEPTED status on the message in milliseconds (default: 5000)
- `API_BASE_URL` - URL for the API for Queue Processor to call on (default: http://localhost:8080/api)

### Frontend Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8080/api)

## Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, libphonenumber-js
- **Backend**: Express, TypeScript, Prisma ORM, PostgreSQL, libphonenumber-js
- **Gateway**: Node.js script (can be substituted with AppleScript)

## Development

### Database Migrations

```bash
cd backend
npx prisma migrate dev --name migration_name
npx prisma studio  # View database in browser
```

### Testing the Gateway

You can test the gateway script directly:

```bash
cd gateway
node send-message.js "test-id" "+1234567890" "+19876543210" "Test message"
```

## Phone Number Validation

This application uses `libphonenumber-js` for phone number validation and formatting:

- **Validation**: Phone numbers are validated on both frontend and backend to ensure they are valid international numbers
- **Format**: Phone numbers are automatically formatted to E.164 format (e.g., `+15551234567`) before being saved to the database
- **Display**: Phone numbers are displayed in international format (e.g., `+1 555 123 4567`) in the UI for better readability
- **Input**: Users can enter phone numbers in various international formats (country code + number) - the system will parse and validate them automatically

Examples of valid phone numbers:

- `+15551234567` (US)
- `+442071234567` (UK)
- `+33123456789` (France)

## Notes

- The gateway currently simulates message sending. One can replace the implementation in `gateway/send-message.js` with  actual iMessage sending solution and adjust the `callGateway` function in `queueProcessor` to run a process with appropriate command (node, python, osascript).
- The queue processor runs continuously once the backend starts.
- The queue processor is run continuously using `setInterval()`
  - `node-cron` can be used as an alternative
- Messages are processed in strict FIFO order based on scheduled time.
- The message list on Dashboard and Home pages auto-refreshes every 5 seconds to show updated message statuses.
- Phone numbers must be valid international numbers in E.164 format. Invalid phone numbers will be rejected with a validation error.
- Node.js, Express, Next.js, and TypeScript were chosen for this project based on the skills asked in the job posting.
  - Prisma ORM and TailwindCSS were added for ease-of-use.
