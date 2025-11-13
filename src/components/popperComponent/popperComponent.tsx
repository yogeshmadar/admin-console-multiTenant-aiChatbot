'use client'
import {  Button, CircularProgress, Grid, Paper, Popper, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import page from '@/components/popperComponent/page.module.css';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cTheme } from "@/theme/colorScheme";


export default function PopperComponent(props: any) {
    const [noBtnLoading, setNoBtnLoading] = useState(false);
    const { push } = useRouter();

    return (
        <>
            <Popper id={props.id} open={props.open} anchorEl={props.anchorEl} placement="top-start" sx={{ pt: "2vh" }} >
                <Paper elevation={2}
                    className={`${page["popper-container"]}`} sx={{ p: "2vh" }}>
                    <Grid container item xs={12}  justifyContent={'flex-end'} alignItems={'center'}  >
                            <CloseIcon fontSize='small' onClick={()=>props.setAnchorEl(null)} sx={{ cursor: 'pointer' }} />
                    </Grid>
                    <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ p: "2vh" }}>
                        <Typography sx={{ fontWeight: '600', color: cTheme.primaryFontColor, fontSize: "18px" }}>Do you want to delete the chatbot?</Typography>

                    </Grid>
                    <Grid container item xs={12} direction={'row'} sx={{ py: "1vh" }} justifyContent={"space-between"} alignItems={"center"}>
                        <Grid container item xs={5.7} justifyContent={'flex-end'} alignItems={'center'}>
                            <Grid item xs={12} sm={6} lg={4.2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={ props.deleteChatbotAPI}
                                    sx={{
                                        backgroundColor: cTheme.primaryFontColor,
                                        '&:hover': { backgroundColor: cTheme.primaryFontColor+" !important" }, batextTransform: "initial"
                                    }}
                                >
                                    {props.deleteChatbotBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'YES'}
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid container item xs={5.7} justifyContent={'flex-start'} alignItems={'center'}>
                            <Grid item xs={12} sm={6} lg={4.2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => { setNoBtnLoading(true); push('/chatbots') }}
                                    sx={{
                                        backgroundColor: cTheme.primaryFontColor+" !important",
                                        '&:hover': { backgroundColor: cTheme.primaryFontColor+" !important" }, batextTransform: "initial"
                                    }}
                                >
                                    {noBtnLoading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'NO'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            </Popper>
        </>
    )
}