function normalizeMynetResponse(data) {
    const volumeData = data.Tooltips['Hacim'];
    const highData = data.Tooltips['Yüksek'];
    const lowData = data.Tooltips['Düşük'];

    return data.ohlc.map(value => {
        const [timestamp, price] = value;
        const volume = volumeData[timestamp];
        const high = highData[timestamp];
        const low = lowData[timestamp];
        return { timestamp, price, volume, high, low };
    });
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

module.exports = {
    normalizeMynetResponse,
    formatDate
}
