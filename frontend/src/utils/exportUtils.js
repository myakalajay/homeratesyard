/**
 * EXPORT UTILITY
 * Converts JSON data to CSV and triggers browser download.
 */
export const exportToCSV = (data, filename) => {
    if (!data || !data.length) {
        alert("No data to export.");
        return;
    }

    // 1. Extract Headers
    const headers = Object.keys(data[0]);
    
    // 2. Convert Rows to CSV format
    const csvContent = [
        headers.join(','), // Header Row
        ...data.map(row => headers.map(fieldName => {
            let value = row[fieldName];
            
            // Handle null/undefined
            if (value === null || value === undefined) return '';
            
            // Handle Objects (like nested 'borrower' or 'manager')
            if (typeof value === 'object') {
                return `"${value.name || value.email || 'N/A'}"`; // Extract meaningful text
            }
            
            // Handle Strings with commas (wrap in quotes)
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            
            return value;
        }).join(','))
    ].join('\n');

    // 3. Create Blob and Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};