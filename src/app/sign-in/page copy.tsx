'use client'

import { Button, CircularProgress, Grid, TextField } from "@mui/material";
import { getSession, signIn } from "next-auth/react";
import Image from 'next/image';
import logo from '@/assets/login/logo.png';
import { useEffect, useState } from "react";
import validateEmail from "@/util/emailValidators";
import { useRouter } from "next/navigation";
import Loginbg from '@/assets/bg.png';
import { setCookie } from "cookies-next";
import SnakBarAlert from "@/components/snakbarAlert/snackbarAlert";
import * as _ from 'lodash'
import { cTheme } from "@/theme/colorScheme";

export default function SignIn() {
    // TODO: Refactor this form
    const [LogIn, setLogIn] = useState<any>({
        Email: '',
        Password: '',
    });
    const [errors, setErrors] = useState({
        Email: '',
        Password: ''
    });
    const [touched, setTouched] = useState({
        Email: false,
        Password: false
    })
    const [signInBtnloading, setSignInBtnLoading] = useState<Boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);

    const { push } = useRouter();

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = 50;
        if(name === 'Email') {
            if(!/^\S+@\S+\.\S+$/.test(value)) {
                error = "Please enter a valid email."
            }
        }
        setLogIn({ ...LogIn, [name]: value });
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }))
        let error = '';
        if (name === 'Email') {
            if (value.trim() === '') {
                error = value.trim() === '' ? `${name} is required` : '';
            } else {
                const isValidEmail = validateEmail(value);
                error = !isValidEmail ? 'Please enter a valid email' : '';
            }
        } else {
            error = value.trim() === '' ? `${name} is required` : '';
        }
        setErrors({ ...errors, [name]: error });
    };

    const onSubmit = async () => {
        if(!_.isEmpty(errors.Email) || !_.isEmpty(errors.Password)) {
            return;
        }
        setSignInBtnLoading(true);

        const result = await signIn("credentials", {
            email: LogIn.Email,
            password: LogIn.Password,
            redirect: false,  
        });
        if (!result?.ok) {
            let errorMessage;
            switch (result?.error) {
                case 'CredentialsSignin':
                    errorMessage = 'Invalid username or password.';
                    break;
                default:
                    errorMessage = 'An unknown error occurred.';
            }
            AlertManager(errorMessage, true);
        } else {
            const session = await getSession();
            var auth_info: any = session?.user;
            AlertManager(auth_info?.message,false);
            setCookie("chatbot_access_token", auth_info?.data?.auth_info, {});
            return push("/chatbots");
        }

    }

     function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        setSignInBtnLoading(false);
    }

    const errorText = (field: keyof typeof errors) => {
        return {
            error: !_.isEmpty(errors[field]) && touched[field],
            helperText: touched[field] ? errors[field] : undefined
        }
    }

    var LogoImage = <Grid container item xs={12} sx={{my:"5vh"}} justifyContent={'center'} alignItems={'center'} >
        <div style={{ cursor: 'pointer' }} >
            <Image src={logo}
                priority={true}
                placeholder="empty"
                alt="chatbot_admin"
                style={{
                    objectFit: 'contain',
                    height:"10vh"
                }}
                unoptimized
            />
        </div>
    </Grid>

return (
        <>
            < div style={{
                backgroundImage: `url(${Loginbg.src})`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                height: "100vh",
            }} >
                <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ height: "100vh", backgroundColor: "transperant" }}>
                    <Grid container item xs={8} justifyContent="flex-start" alignItems="center" sx={{ backgroundColor: "transperant", mb: "18vh" }}>
                        <Grid container item xs={10} sm={7} md={6} lg={4} direction={'column'} justifyContent={"center"} alignItems={"center"} sx={{mt:"5vh"}}>
                            {LogoImage}
                            <Grid container item xs={11} >
                                <TextField
                                    fullWidth
                                    name="Email"
                                    id="email"
                                    type="email"
                                    placeholder="Email ID"
                                    size="small"
                                    variant="standard"
                                    value={LogIn.Email}
                                    {...errorText('Email')}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    InputProps={{ sx: { my: "2vh", maxLength: 51 } }}
                                />
                            </Grid>
                            <Grid container item xs={11}>
                                <TextField
                                    fullWidth
                                    name="Password"
                                    id="password"
                                    type='password'
                                    placeholder="Password"
                                    size="small"
                                    variant="standard"
                                    {...errorText('Password')}
                                    value={LogIn.Password}
                                    helperText={errors.Password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    InputProps={{
                                        sx: { my: "2vh", maxLength: 51 },
                                        onKeyDown: (e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault(); 
                                                onSubmit();
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid container item xs={12} sx={{ py: "2vh", my: "6vh" }}>
                                <Button
                                    fullWidth
                                    disabled={!LogIn.Email.length || !LogIn.Password.length}
                                    variant="contained"
                                    onClick={onSubmit}
                                    sx={{ backgroundColor:!LogIn.Email.length || !LogIn.Password.length ? '#F6F5FB' : cTheme.primaryFontColor,'&:hover':{backgroundColor:cTheme.primaryFontColor+" !important"}, batextTransform: "initial" }}
                                >
                                    {signInBtnloading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'SIGN IN'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}