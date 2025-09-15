export const QuerysCajas = 
{
    getResultadoCaja:
	`
		
		EXEC RIP.RESULTADO_CAJA @FECHA , @CAJA
	`,
	 getResultadoAsiento:
	`
		
		EXEC RIP.VER_ASIENTO @FECHA , @CAJA , @REDONDEO , @Z
	`
	
}