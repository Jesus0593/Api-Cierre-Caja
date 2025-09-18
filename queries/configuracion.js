export const QuerysConfiguracion = {
  getConfiguracion: [
    `
    IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'RipCaja')
    BEGIN
      EXEC('CREATE SCHEMA [RipCaja]')
    END
    `,
    `
    IF NOT EXISTS (SELECT * FROM sys.objects 
    WHERE object_id = OBJECT_ID(N'[RipCaja].[RIP_CONFIGURACIONCUENTAS]') 
    AND type in (N'U'))
    BEGIN
      CREATE TABLE [RipCaja].[RIP_CONFIGURACIONCUENTAS](
        [SOBRANTEVENTA] [nvarchar](20) NULL,
        [FALTANTEVENTA] [nvarchar](20) NULL,
        [SOBRANTEREDONDEO] [nvarchar](20) NULL,
        [FALTANTEREDONDEO] [nvarchar](20) NULL,
        [IVA] [nvarchar](20) NULL,
        [COMISIONBANCARIA] [nvarchar](20) NULL,
        [RAIZPAGARE] [nvarchar](20) NULL,
        [RAIZUTILIDAD] [nvarchar](20) NULL,
        [APERTURA] [nchar](10) NULL
      ) ON [PRIMARY]
    END
    `,
    `
    IF NOT EXISTS (SELECT * FROM sys.objects 
    WHERE object_id = OBJECT_ID(N'[RipCaja].[RIP_PERMISOSUSUARIOS]') 
    AND type in (N'U'))
    BEGIN
      CREATE TABLE [RipCaja].[RIP_PERMISOSUSUARIOS](
        [CODUSUARIO] [int] NOT NULL,
        [VISUALIZARPAGARES] [int] NOT NULL,
        [VISUALIZARCAJAS] [int] NOT NULL,
        [VISUALIZARREPORTES] [int] NOT NULL,
        [DESCONTABILIZAR] [int] NOT NULL,
        [CONTABILIZAR] [nvarchar](1) NULL,
        [REGISTRARPAGARES] [nvarchar](1) NULL,
        [VISUALIZARCONFIGURACION] [int] NULL,
        [VISUALIZARTRANSFERENCIAS] [int] NULL,
        [VISUALIZARVENTAS] [int] NULL,
        [VISUALIZARBALANCES] [int] NULL,
        [VISUALIZARDETALLEBANCO] [int] NULL
      ) ON [PRIMARY]
    END
    `,
    `
    ALTER TABLE [RipCaja].[RIP_PERMISOSUSUARIOS] ADD DEFAULT ((1)) FOR [VISUALIZARPAGARES]
    `,
    `
    ALTER TABLE [RipCaja].[RIP_PERMISOSUSUARIOS] ADD DEFAULT ((1)) FOR [VISUALIZARCAJAS]
    `,
    `
    ALTER TABLE [RipCaja].[RIP_PERMISOSUSUARIOS] ADD DEFAULT ((1)) FOR [VISUALIZARREPORTES]
    `,
    `
    ALTER TABLE [RipCaja].[RIP_PERMISOSUSUARIOS] ADD DEFAULT ((1)) FOR [DESCONTABILIZAR]
    `,
    `
    ALTER TABLE [RipCaja].[RIP_PERMISOSUSUARIOS] ADD DEFAULT ((1)) FOR [CONTABILIZAR]
    `,
    `
    ALTER TABLE [RipCaja].[RIP_PERMISOSUSUARIOS] ADD DEFAULT ((0)) FOR [REGISTRARPAGARES]
    `,
    `
    ALTER TABLE [RipCaja].[RIP_PERMISOSUSUARIOS] ADD DEFAULT ((0)) FOR [VISUALIZARCONFIGURACION]
    `,
    `
    ALTER TABLE [RipCaja].[RIP_PERMISOSUSUARIOS] ADD DEFAULT ((0)) FOR [VISUALIZARTRANSFERENCIAS]
    `,
    `
    ALTER TABLE [RipCaja].[RIP_PERMISOSUSUARIOS] ADD DEFAULT ((0)) FOR [VISUALIZARVENTAS]
    `,
    `
    ALTER TABLE [RipCaja].[RIP_PERMISOSUSUARIOS] ADD DEFAULT ((0)) FOR [VISUALIZARBALANCES]
    `
  ],
  getConfiguracionEmpresas:[
    `
    IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'RipCaja')
    BEGIN
      EXEC('CREATE SCHEMA [RipCaja]')
    END
    `,
    `
    IF NOT EXISTS (SELECT * FROM sys.objects
				WHERE object_id = OBJECT_ID(N'[dbo].[RIPV_DECLARADOZ]') 
				AND type in (N'V'))
      BEGIN 
        EXEC ('
            CREATE VIEW [dbo].[RIPV_DECLARADOZ] AS
              SELECT 
                DZ.TIPO
                , DZ.CAJA
                , DZ.NUMZ
                , DZ.CODMONEDA
                , ISNULL(COTI.COTIZACION,1)*IMPORTE IMPORTE
                , DZ.CODMEDIOPAGO
                , DZ.OBSERVACIONES
                , DZ.IDMOTIVO
                , DZ.AUTO
                , DZ.DESCUADRE

              FROM
                ARQUEOS ARQ  WITH (NOLOCK)
                INNER JOIN DECLARADOZ DZ  WITH (NOLOCK) ON DZ.CAJA=ARQ.CAJA AND DZ.NUMZ=ARQ.NUMERO AND ARQ.ARQUEO=''Z''
                LEFT JOIN COTIZACIONES COTI  WITH (NOLOCK) ON DZ.CODMONEDA=COTI.CODMONEDA AND ARQ.FECHA=COTI.FECHA
          ')
      END 

    `,
    `
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RIP_FORMASPAGOS]') 
				AND type in (N'U')) 
      BEGIN
        CREATE TABLE [dbo].[RIP_FORMASPAGOS](
          [ID] [int] IDENTITY(1,1) NOT NULL,
          [DESCRIPCION] [nvarchar](100) NOT NULL
        ) ON [PRIMARY]
      END
      
    `, 
    `
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RIP_RELACIONFORMASPAGO]') 
				AND type in (N'U')) 
      BEGIN
       CREATE TABLE [dbo].[RIP_RELACIONFORMASPAGO](
          [CODFORMAPAGO] [nvarchar](6) NULL,
          [IDFORMAPAGO] [int] NULL
        ) ON [PRIMARY]
      END
      
    `,
    `
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[RipCaja].[PROC_GETCOTIZACION]') AND type in(N'P'))
	BEGIN
	  EXEC ('
        CREATE PROCEDURE [rip].[PROC_GETCOTIZACION](@FECHA AS DATE , @IMPORTE AS FLOAT=1) AS SET NOCOUNT ON
            DECLARE 
              @MONEDA_VES AS INT =4
              , @MONEDA_USD AS INT=2
              , @MONEDA_EUR AS INT=3

            DECLARE
              @ISO_MONEDA_VES AS NVARCHAR(3)=(SELECT M.CODIGOISO FROM MONEDAS M WHERE M.CODMONEDA=@MONEDA_VES)
              , @ISO_MONEDA_USD AS NVARCHAR(3)=(SELECT M.CODIGOISO FROM MONEDAS M WHERE M.CODMONEDA=@MONEDA_USD)
              , @ISO_MONEDA_EUR AS NVARCHAR(3)=(SELECT M.CODIGOISO FROM MONEDAS M WHERE M.CODMONEDA=@MONEDA_EUR)

            --PRIMERO DE BS A TODAS LAS MONEDAS
            SELECT FORMAT(@IMPORTE,''n'',''es-VE'')+'' ''+ @ISO_MONEDA_VES+'' = ''+FORMAT(@IMPORTE/dbo.F_GET_COTIZACION(@FECHA, @MONEDA_VES),''n'',''es-VE'')+'' ''+@ISO_MONEDA_USD MENSAJE
            UNION ALL
            SELECT FORMAT(@IMPORTE,''n'',''es-VE'')+'' ''+ @ISO_MONEDA_VES+'' = ''+FORMAT(@IMPORTE/dbo.F_GET_COTIZACION(@FECHA, @MONEDA_VES)*1/dbo.F_GET_COTIZACION(@FECHA, @MONEDA_EUR),''n'',''es-VE'')+'' ''+@ISO_MONEDA_EUR MENSAJE
            --AHORA DE USD AL RESTO
            UNION ALL
            SELECT FORMAT(@IMPORTE,''n'',''es-VE'')+'' ''+ @ISO_MONEDA_USD+'' = ''+FORMAT(@IMPORTE*dbo.F_GET_COTIZACION(@FECHA, @MONEDA_VES),''n'',''es-VE'')+'' ''+@ISO_MONEDA_VES MENSAJE
            UNION ALL
            SELECT FORMAT(@IMPORTE,''n'',''es-VE'')+'' ''+ @ISO_MONEDA_USD+'' = ''+FORMAT(@IMPORTE*1/dbo.F_GET_COTIZACION(@FECHA, @MONEDA_EUR),''n'',''es-VE'')+'' ''+@ISO_MONEDA_EUR MENSAJE
            --AHORA DE EUROS AL RESTO
            --AHORA DE USD AL RESTO
            UNION ALL
            SELECT FORMAT(@IMPORTE,''n'',''es-VE'')+'' ''+ @ISO_MONEDA_EUR+'' = ''+FORMAT(@IMPORTE*dbo.F_GET_COTIZACION(@FECHA, @MONEDA_EUR)*dbo.F_GET_COTIZACION(@FECHA, @MONEDA_VES),''n'',''es-VE'')+'' ''+@ISO_MONEDA_VES MENSAJE
            UNION ALL
            SELECT FORMAT(@IMPORTE,''n'',''es-VE'')+'' ''+ @ISO_MONEDA_EUR+'' = ''+FORMAT(@IMPORTE*dbo.F_GET_COTIZACION(@FECHA, @MONEDA_EUR),''n'',''es-VE'')+'' ''+@ISO_MONEDA_USD MENSAJE
	')
	END

    `
  ]
};