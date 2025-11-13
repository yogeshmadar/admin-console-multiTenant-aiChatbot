"use client"
import { useRouter } from 'next/navigation';
import React, { useState } from "react";
import { Grid, Typography, Divider, CircularProgress, Box } from "@mui/material";
import DateFormats from '@/util/dateFormats';
import { cTheme } from '@/theme/colorScheme';

const backgroundColor = (isActive: boolean = true) => {
    return {
        '&:hover': { backgroundColor: isActive ? "#F6F5FB" : '#FF8989' },
        backgroundColor: isActive ? undefined : '#FCAEAE'
    }
}

export default function Cards(props: any) {
    const { push } = useRouter();
    const [isCardLoader, setisCardLoader] = useState(false);

    return (
        <Grid item xs={12} sm={12} md={5.8} xl={5.8} sx={{ cursor: 'pointer', ...backgroundColor(props?.item?.is_active), border: '0.1vw solid #D8D8D8', borderRadius: "1vh", mb: "0.2vh", boxShadow: '1.5px 1.5px 1.5px rgba(0, 0, 0, 0.1)' }} onClick={() => { setisCardLoader(true); push(`chatbots/${props?.item?.bot_id}`) }} >
            <Grid container item xs={12} direction='row' sx={{ px: "1.3vh", py: "1.8vh" }}>
                <Grid container item xs={7.5} justifyContent={"center"} alignItems={"center"} >
                    <Grid container item xs={12} justifyContent={"flex-start"} alignItems={"center"}  >
                        <Typography variant="body1" sx={{ fontWeight: '700', color: cTheme.primaryFontColor }}>{props?.item?.bot_name}</Typography>
                    </Grid>
                    <Grid container item xs={12} justifyContent={"flex-start"} alignItems={"center"}>
                        <Typography variant="caption" sx={{ fontWeight: '500' }}>
                            {DateFormats(props?.item?.updated_datetime, false)}</Typography>
                    </Grid>
                    <Grid container item xs={12} justifyContent={"flex-start"} alignItems={"center"}>
                        <Typography sx={{ fontWeight: '800', fontSize: "11px", overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {props?.item?.whitelist_domain}</Typography>
                    </Grid>
                    {props?.item?.crawl_error && <Box sx={{ width: "100%", paddingTop: "10px" }}>
                        <Divider orientation='horizontal' variant="middle" flexItem />
                        <Typography variant="caption" sx={{ fontWeight: '600', color: 'red', fontSize: "10px" }}>Failed to crawl the sitemap url.</Typography>
                    </Box>
                    }
                </Grid>
                <Grid container item xs={0.5} justifyContent={'center'} alignItems={"center"} >
                    {isCardLoader ? <> <CircularProgress sx={{ color: cTheme.primaryFontColor }} size={20} /></> : null}
                    <Divider orientation="vertical" variant="middle" flexItem />
                </Grid>
                <Grid container item xs={4} justifyContent={"center"} alignItems={"center"} >
                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"}  >
                        <Typography variant="caption" sx={{ fontWeight: '500' }}>Total Conversation</Typography>
                    </Grid>
                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} >
                        <Typography variant="caption" sx={{ fontWeight: '800', color: 'black' }}>{props?.item?.thread_counts}</Typography>
                    </Grid>
                    <Divider orientation='horizontal' sx={{ width: '100%' }} />
                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} >
                        <Grid container item xs={6} justifyContent={"center"} alignItems={"center"} >
                            <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} >
                                <Typography variant="caption" sx={{ fontWeight: '500', color: 'black' }}>Likes</Typography>
                            </Grid>
                            <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} >
                                <Typography variant="caption" sx={{ fontWeight: '800', color: 'black' }}>{props?.item?.likes}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={6} justifyContent={"center"} alignItems={"center"} >
                            <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} >
                                <Typography variant="caption" sx={{ fontWeight: '500', color: 'black' }}>Dislikes</Typography>
                            </Grid>
                            <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} >
                                <Typography variant="caption" sx={{ fontWeight: '800', color: 'black' }}>{props?.item?.dislikes}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

        </Grid>
    )
}