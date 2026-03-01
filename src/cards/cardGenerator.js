export const generateCardNumber = () => {
    return "4" + Math.floor(100000000000000 + Math.random() * 900000000000000);
};

export const generateCVV = () => {
    return Math.floor(100 + Math.random() * 900).toString();
};

export const generateExpirationDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 5);
    return date.toISOString().split("T")[0];
};