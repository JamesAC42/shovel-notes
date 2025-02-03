export const formatDateTime = (dateString) => {
    if (!dateString) return "Never";
    
    try {
        // Parse the UTC timestamp
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            console.warn('Invalid date string received:', dateString);
            return "Invalid date";
        }

        // Convert UTC to local time
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        
        // Format in local time
        return localDate.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting date:', error, 'for dateString:', dateString);
        return "Date error";
    }
}; 