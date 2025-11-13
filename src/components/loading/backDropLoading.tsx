import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material'

export default function BackDropLoading(props: any) {

    return (
        <Backdrop
            sx={{ color: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={props.isLoading}>
            <CircularProgress sx={{color:"white"}} size={30} />
        </Backdrop>

    )
}