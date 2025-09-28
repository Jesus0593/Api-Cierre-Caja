export const QuerysCajas = 
{
    getResultadoCaja:
	`
		
		EXEC ripAppWeb.RESULTADOSCAJAS @FECHA , @CAJA
	`,
	 getResultadoAsiento:
	`
		
		EXEC ripAppWeb.VERASIENTOCAJA @FECHA , @CAJA , @REDONDEO , @Z
	`
	
}