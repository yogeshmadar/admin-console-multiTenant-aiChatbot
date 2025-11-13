'use client'

import {Box, Button, CircularProgress, Grid, Typography } from "@mui/material"
import pages from '@/components/sidebar/page.module.css';
import React, { useEffect, useRef, useState } from "react";
import DateFormats from "@/util/dateFormats";
import { getCookie } from "cookies-next";
import SnakBarAlert from "@/components/snakbarAlert/snackbarAlert";
import BackDropLoading from "@/components/loading/backDropLoading";
import { useRouter } from "next/navigation";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { cTheme } from "@/theme/colorScheme";


export default function Message(props: any) {
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [viewAllThreadLoader, setViewAllThreadLoader] = useState(false);
    const [pageLoading,  setPageLoading] = useState(false);
    const [messages, setMessages] = useState<any>([]);
    const firstName: any = getCookie("first_name");
    const lastName: any = getCookie("last_name");
    const { push } = useRouter();


    async function viewMessagesAPI() {
        try {
            setPageLoading(true);
            const response = await fetch(`/api/messages/${props.params.bot_uuid}/${props.params.thread_uuid}`, {
                method: 'GET',
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const viewMessagesResponse = await response.json();
            if (response.status == 200) {
                setMessages(viewMessagesResponse?.data);
                setPageLoading(false);
            }
            else {
                AlertManager("Something went wrong", true);
            }
        }
        catch (error: any) {
            AlertManager("Something went wrong", true);
        }
    }

    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        setPageLoading(false);
    }

    useEffect(() => {
        viewMessagesAPI();
    }, [])

    return (
        <div className={`${pages["custom-container"]}`} style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'flex-start'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 4, mt: "5vh", minHeight: "90vh" }} >
                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} >
                        <Grid container item xs={12} direction="row" justifyContent={"center"} alignItems={"center"} >
                        <Grid container item direction="row" alignItems="center" xs={12} sm={9} md={9} lg={10} gap={1.5} justifyContent={'space-between'} sx={{ mb: 1 }}>
                            <Grid item  >
                            <Typography variant="body1" sx={{ fontWeight: "700", color: cTheme.primaryFontColor }}> Message Threads - {firstName}&nbsp;{lastName}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} sm={3} md={3} lg={2} justifyContent={"flex-end"} >
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => { setViewAllThreadLoader(true); push('/message_threads') }}
                                sx={{ textTransform: "initial", backgroundColor: cTheme.primaryFontColor, borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: cTheme.primaryBackground } }}
                            >
                                
                                {viewAllThreadLoader ?
                                    <CircularProgress sx={{ color: 'white' }} size={20} /> :
                                    <Typography variant="caption" sx={{ fontWeight: "700" }}>ALL MESSAGE THREADS</Typography>
                                }
                            </Button>
                        </Grid>
                    </Grid>
                        
                        <Grid container sx={{ borderBottom: "3px solid #F6F5FB", mt: "2vh" }}  > </Grid>
                        <Grid container item xs={7} justifyContent={'center'} alignItems={'center'} sx={{ mt: "5vh" }}>
                            {messages.map((item: any, index: number) => {
                                return (
                                    <React.Fragment key={index} >
                                        {item.sender_id == 1 &&
                                            <Grid container item xs={11.5} justifyContent={'flex-end'} sx={{marginBottom: "5vh"}}>
                                                <Grid container item xs={12} direction={'column'} alignItems={'flex-start'} >
                                                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                        <Typography variant="caption">{DateFormats(item.sent_date_time,false)}  </Typography>
                                                        <Typography variant="body1" sx={{ marginLeft: '4px',color:cTheme.primaryFontColor }}>{firstName}&nbsp;{lastName}</Typography>
                                                    </div>
                                                    <QACard value={item.message} type={"Q"} />
                                                </Grid>
                                            </Grid>
                                        }
                                        {item.receiver_id == 1 &&
                                            <Grid container item xs={11.5} justifyContent={'flex-start'} sx={{ backgroundColor: 'transparent', marginBottom: "5vh"}} >
                                                <Grid container direction={'column'} item xs={12} alignItems={'flex-end'}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                        <Typography variant="body1" sx={{color:cTheme.primaryFontColor}} >Chatbot</Typography>
                                                        <Typography variant="caption" sx={{ marginLeft: "4px" }}>{DateFormats(item.sent_date_time,false)}</Typography>
                                                    </div>
                                                    <QACard value={item.message} type={"A"} />
                                                    {
                                                        item.feedback === 'liked' ?
                                                            <ThumbUpIcon sx={{fill: '#F6F5FB', stroke: 'rgba(0, 0, 0, 0.12)'}}/>
                                                            : item.feedback === 'disliked' ?
                                                            <ThumbDownIcon sx={{fill: '#F6F5FB', stroke: 'rgba(0, 0, 0, 0.12)'}}/>
                                                            : undefined
                                                    }

                                                </Grid>
                                            </Grid>
                                        }
                                    </React.Fragment>
                                )
                            })
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={pageLoading}/>
        </div >
    )
}


const QACard = (props: any) => {
    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '10vh',
                border: (theme: any) => `1px solid ${theme.palette.divider}`,
                borderRadius: "1.3vw",
                bgcolor: '#F6F5FB',
                alignItems: "center",
            }}
        >
            <p style={{ display: 'flex', justifyContent: props.type == 'A' ?   ' flex-end' : 'flex-start', alignItems: "center", width: "100%", padding: "3vh", wordBreak: 'break-word' }}>
                {props.value}
            </p>
        </Box>
    )
}