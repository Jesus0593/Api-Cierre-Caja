export const QuerysEmpresas = 
{
  getEmpresaToId:
	`
        DECLARE @CODIGO AS INT;
        DECLARE @CONTABLE AS NVARCHAR(50);
        DECLARE @GESTION AS NVARCHAR(50);
        DECLARE @EJERCICIO AS INT;
        DECLARE @query NVARCHAR(MAX);

        -- Crear una tabla temporal en lugar de una variable de tabla
        CREATE TABLE #TABLAEMPRESA (
            CODIGO INT,
            EJERCICIO INT,
            PATHBD NVARCHAR(50) COLLATE Latin1_General_CS_AI -- Asegurar la intercalación correcta
        );

        DECLARE datos CURSOR FOR
            SELECT
                EC.CODIGO,
                EC.EJERCICIO,
                SUBSTRING(EC.PATHBD, CHARINDEX(':', EC.PATHBD) + 1, LEN(EC.PATHBD)) AS DB_CONTABLE,
                SUBSTRING(EM.PATHBD, CHARINDEX(':', EM.PATHBD) + 1, LEN(EM.PATHBD)) AS DB_GESTION
            FROM 
                EMPRESAS EM WITH(NOLOCK)
                INNER JOIN EMPRESASUSUARIO EU WITH(NOLOCK) ON EU.CODEMPRESA = EM.CODEMPRESA AND EU.CODUSUARIO = @CODUSUARIO
                INNER JOIN EMPRESASCONTAUSUARIO ECU WITH(NOLOCK) ON ECU.CODEMPGESTION = EU.CODEMPRESA AND ECU.CODUSUARIO = @CODUSUARIO
                INNER JOIN EMPRESASCONTABLES EC WITH(NOLOCK) ON ECU.CODEMPRESA = EC.CODIGO AND ECU.EJERCICIO = EC.EJERCICIO;

        OPEN datos;

        FETCH NEXT FROM datos INTO @CODIGO, @EJERCICIO, @CONTABLE, @GESTION;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Construir la consulta dinámica
            SET @query = '
                IF NOT EXISTS (
                    SELECT DISTINCT 
                        EC.CODIGO,
                        EC.EJERCICIO,
                        SUBSTRING(EC.PATHBD, CHARINDEX('':'', EC.PATHBD) + 1, LEN(EC.PATHBD)) AS BD
                    FROM
                        ' + QUOTENAME(@GESTION) + '.DBO.SERIES S
                        INNER JOIN EMPRESASCONTABLES EC ON EC.CODIGO = CAST(SUBSTRING(S.CONTABILIDADB, 6, 3) AS INT) 
                            AND EC.EJERCICIO = CAST(SUBSTRING(S.CONTABILIDADB, 2, 4) AS INT)
                        INNER JOIN #TABLAEMPRESA TEM ON TEM.CODIGO = EC.CODIGO 
                            AND TEM.EJERCICIO = EC.EJERCICIO 
                            AND TEM.PATHBD COLLATE Latin1_General_CS_AI = SUBSTRING(EC.PATHBD, CHARINDEX('':'', EC.PATHBD) + 1, LEN(EC.PATHBD)) COLLATE Latin1_General_CS_AI
                    WHERE
                        (S.SERIE LIKE ''__'')
                        AND S.SERIE NOT LIKE ''Z%''
                )
                BEGIN
                    INSERT INTO #TABLAEMPRESA
                    SELECT DISTINCT 
                        EC.CODIGO,
                        EC.EJERCICIO,
                        SUBSTRING(EC.PATHBD, CHARINDEX('':'', EC.PATHBD) + 1, LEN(EC.PATHBD)) AS BD
                    FROM
                        ' + QUOTENAME(@GESTION) + '.DBO.SERIES S
                        INNER JOIN EMPRESASCONTABLES EC ON EC.CODIGO = CAST(SUBSTRING(S.CONTABILIDADB, 6, 3) AS INT) 
                            AND EC.EJERCICIO = CAST(SUBSTRING(S.CONTABILIDADB, 2, 4) AS INT)
                    WHERE
                        (S.SERIE LIKE ''__'')
                        AND S.SERIE NOT LIKE ''Z%'';
                END;
            ';

            -- Ejecutar la consulta dinámica
            EXEC sp_executesql @query;

            FETCH NEXT FROM datos INTO @CODIGO, @EJERCICIO, @CONTABLE, @GESTION;
        END;

        CLOSE datos;
        DEALLOCATE datos;

        -- Seleccionar los datos de la tabla temporal
        SELECT
            EM.CODEMPRESA,
            EM.TITULO,
            EC.CODIGO,
            EC.EJERCICIO,
            SUBSTRING(EM.PATHBD, CHARINDEX(':', EM.PATHBD) + 1, LEN(EM.PATHBD)) AS DB_GESTION,
            EC.PATHBD AS DB_CONTABLE
        FROM 
            EMPRESAS EM WITH(NOLOCK)
            INNER JOIN EMPRESASUSUARIO EU WITH(NOLOCK) ON EU.CODEMPRESA = EM.CODEMPRESA AND EU.CODUSUARIO = @CODUSUARIO
            INNER JOIN EMPRESASCONTAUSUARIO ECU WITH(NOLOCK) ON ECU.CODEMPGESTION = EU.CODEMPRESA AND ECU.CODUSUARIO = @CODUSUARIO
            INNER JOIN #TABLAEMPRESA EC WITH(NOLOCK) ON ECU.CODEMPRESA = EC.CODIGO AND ECU.EJERCICIO = EC.EJERCICIO;

        -- Eliminar la tabla temporal (opcional, se elimina automáticamente al finalizar la sesión)
        DROP TABLE #TABLAEMPRESA; 
	`,
    getTiendas:
    `
        SELECT DISTINCT 
            S.SERIE SERIE,
            S.DESCRIPCION DESCRIPCION,
            SUBSTRING(EC.PATHBD, CHARINDEX(':',EC.PATHBD)+1,LEN(EC.PATHBD)) BD
            , SCL.CODCLIENTE CODCLIENTE
            , CAJA.IDFRONT
        FROM
            SERIES S 
            INNER JOIN GENERAL.dbo.EMPRESASCONTABLES EC ON EC.CODIGO=CAST(SUBSTRING(S.CONTABILIDADB,6,3) AS INT) AND EC.EJERCICIO=CAST(SUBSTRING(S.CONTABILIDADB,2,4) AS INT)
            INNER JOIN SERIESCAMPOSLIBRES SCL ON S.SERIE=SCL.SERIE
            INNER JOIN (SELECT RC.IDFRONT, SUBSTRING(RC.SERIEINVENTARIO,1,2) COLLATE Latin1_General_CS_AI SERIE FROM REM_CAJASFRONT RC WHERE CAJAFRONT=1
                    UNION ALL 
                    SELECT 1, SERIE FROM SERIES WHERE SERIE LIKE '___' AND NOT SERIE LIKE '%0%' ) CAJA ON S.SERIE=CAJA.SERIE 
        WHERE
            (S.SERIE LIKE '__' OR S.SERIE LIKE '___')
            AND S.SERIE NOT LIKE 'Z%'
    `
}
