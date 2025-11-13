'use client'
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { getSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import layer from '@/assets/login/Layer_5.png';

export default function HomePage() {

    const [signOutBtnloading, setSignOutBtnLoading] = useState<Boolean>(false);
    const [email, setEmail] = useState<string>();

    useEffect(() => {
        const session = getSession();

        Promise.resolve(session).then((data: any) => {
            const  userEmail = data.user.email;
           setEmail(userEmail); 
        }).catch((error:any) => {
            console.error('Error occurred while resolving the Promise:', error);
        });
    }, [])

    
    return (
        <>
            < div style={{
                backgroundImage: `url(${layer.src})` ,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                height: "100vh",
            }} >
                <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ height: "100vh", backgroundColor: "transperant" }}>
                    <Grid container item xs={8} justifyContent="flex-start" alignItems="center" sx={{ backgroundColor: "transperant", mb: "18vh" }}>
                        <Grid container item xs={10} sm={7} md={6} lg={3} direction={'column'} justifyContent={"center"} alignItems={"center"}>
                            <Typography sx={{fontSize:"3vh",p:"5vh"}} >{email} </Typography>
                            {/* <Button
                                fullWidth
                                variant="contained"
                                onClick={() => {setSignOutBtnLoading(true);  signOut({ callbackUrl: '/' });  }}
                                sx={{ backgroundColor: "#81312a!important", textTransform: "initial" }}
                            >
                                {signOutBtnloading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'SIGN OUT'}
                            </Button> */}
                        </Grid>
                    </Grid>
                </Grid>
        </div >
        </>
    )
}