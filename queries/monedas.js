export const QuerysMonedas = 
{
    getToConvert:
	`
		
		EXEC ripAppWeb.PROC_GETCOTIZACION @FECHA , @IMPORTE
	`
	
}
