"use client";

import React from "react";
import { Snackbar, Alert, Grid } from '@mui/material'

export default function SnakBarAlert(props: any) {
return(
    <Grid item xs={3} sm={3} justifyContent={'center'} alignItems={'center'}>
        <Snackbar open={props.alertOpen} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={6000} onClose={() => props.setAlertOpen(false)}>
            <Alert onClose={() =>props. setAlertOpen(false)} severity={props.alertSeverity ? 'error' : 'success'} variant='filled' sx={{color:'white' }}>
                {props.alert}
            </Alert>
        </Snackbar>
    </Grid>
)
}