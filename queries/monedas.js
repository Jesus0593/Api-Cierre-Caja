export const QuerysMonedas = 
{
    getToConvert:
	`
		EXEC RIP.PROC_GETCOTIZACION @FECHA,@IMPORTE
	`
	
}
