export const QuerysEmpresas = 
{
  getEmpresaToId:
    `
        SELECT DISTINCT 
            CODUSUARIO,
            USUARIO,
            CODEMPRESAGESTION,
            GESTION,
            BDGESTION
        FROM 
            ripAppWeb.EMPRESAUSUARIOS
        WHERE
            CODUSUARIO = @CODUSUARIO
    `,
    getTiendas:
    `
        SELECT * FROM ripAppWeb.TIENDASEMPRESA
    `
}
