class Security {
    constructor() {
        // Constantes utilizadas para encriptar/desencriptar
        this.constants = [78, 79, 82, 77, 65, 76, 75, 69, 89, 78, 79, 82, 77, 65, 76, 75, 69, 89, 78, 
                          79, 82, 77, 65, 76, 75, 69, 89, 78, 79, 82, 77, 65, 76, 75, 69, 89, 78];
    }

    /**
     * Encripta un texto utilizando las constantes predefinidas.
     * @param {string} text - Texto a encriptar.
     * @returns {string} - Texto encriptado.
     */
    encrypt(text) {
        if (!text) throw new Error('El texto a encriptar no puede estar vacío.');

        let encrypted = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) + this.constants[i];
            encrypted += charCode.toString(16).toUpperCase(); // Convertir a hexadecimal
        }
        return encrypted;
    }

    /**
     * Desencripta un texto encriptado utilizando las constantes predefinidas.
     * @param {string} encryptedText - Texto encriptado.
     * @returns {string} - Texto desencriptado.
     */
    decrypt(encryptedText) {
        if (!encryptedText) throw new Error('El texto a desencriptar no puede estar vacío.');

        let decrypted = '';
        let j = 0;

        for (let i = 0; i < encryptedText.length; i += 2) {
            const hexValue = encryptedText.substring(i, i + 2);
            const charCode = parseInt(hexValue, 16) - this.constants[j];
            decrypted += String.fromCharCode(charCode);
            j++;
        }
        return decrypted;
    }
}

export default Security;
