// Get CSS class for status color
export function getStatusColor(status: string): string {
  switch (status) {
    case "SENT":
      return "status-sent";
    case "DELIVERED":
      return "status-delivered";
    case "FAILED":
      return "status-failed";
    case "ACCEPTED":
      return "status-accepted";
    case "QUEUED":
    default:
      return "status-queued";
  }
}