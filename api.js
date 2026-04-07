const API_URL = 'https://script.google.com/macros/s/AKfycbywpkAyWkatvCxl8LTuhrGuumPxZES3LpAmb_K7JX-sUDYqutIwezubQ0p5yxMq9YqVYg/exec';

const api = {
    fetchData(callback) {
        const script = document.createElement('script');
        script.src = `${API_URL}?action=read&callback=${callback}&_=${new Date().getTime()}`;
        document.body.appendChild(script);
        script.onload = () => script.remove();
    },
    saveData(data, callback) {
        const params = new URLSearchParams({ ...data, callback: callback });
        const script = document.createElement('script');
        script.src = `${API_URL}?${params.toString()}`;
        document.body.appendChild(script);
        script.onload = () => script.remove();
    }
};