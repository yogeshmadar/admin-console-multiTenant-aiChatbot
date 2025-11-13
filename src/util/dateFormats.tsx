
export default function DateFormats(inputdate: any, dateFormatControl: boolean) {
    const formattedDate = new Date(inputdate).toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    const formattedTime= new Date(inputdate).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
    return dateFormatControl == false ? formattedDate  : formattedTime   
}
