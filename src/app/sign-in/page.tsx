'use client'

import { Button, CircularProgress, Grid, TextField, Paper, Typography } from "@mui/material";
import { getSession, signIn } from "next-auth/react";
import Image from 'next/image';
import logo from '@/assets/login/logo.png';
import { useEffect, useState } from "react";
import validateEmail from "@/util/emailValidators";
import { useRouter } from "next/navigation";
import Loginbg from '@/assets/bg.png';
import { setCookie } from "cookies-next";
import SnakBarAlert from "@/components/snakbarAlert/snackbarAlert";
import * as _ from 'lodash';
import { cTheme } from "@/theme/colorScheme";

export default function SignIn() {
    const [LogIn, setLogIn] = useState<any>({ Email: '', Password: '' });
    const [errors, setErrors] = useState({ Email: '', Password: '' });
    const [touched, setTouched] = useState({ Email: false, Password: false });
    const [signInBtnloading, setSignInBtnLoading] = useState<Boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);

    const { push } = useRouter();

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        if (name === 'Email') {
            if (!/^\S+@\S+\.\S+$/.test(value)) error = "Please enter a valid email.";
        }
        setLogIn({ ...LogIn, [name]: value });
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        let error = '';
        if (name === 'Email') {
            if (value.trim() === '') {
                error = 'Email is required';
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
        if (!_.isEmpty(errors.Email) || !_.isEmpty(errors.Password)) return;
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
            AlertManager(auth_info?.message, false);
            setCookie("chatbot_access_token", auth_info?.data?.auth_info, {});
            return push("/chatbots");
        }
    };

    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        setSignInBtnLoading(false);
    }

    const errorText = (field: keyof typeof errors) => ({
        error: !_.isEmpty(errors[field]) && touched[field],
        helperText: touched[field] ? errors[field] : undefined
    });

    return (
        <>
            <div
                style={{
                    backgroundImage: `url(${Loginbg.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: "100vh",
                    width: "100%",
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={10}
                    sx={{
                        width: { xs: '90%', sm: '75%', md: '35%' },
                        borderRadius: 3,
                        px: { xs: 4, md: 6 },
                        py: { xs: 5, md: 7 },
                        backdropFilter: 'blur(12px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {/* Logo */}
                    <Image
                        src={logo}
                        priority
                        alt="Chatbot Admin"
                        style={{
                            objectFit: 'contain',
                            height: '12vh',
                            marginBottom: '2rem'
                        }}
                        unoptimized
                    />

                    {/* Heading */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: cTheme.primaryFontColor,
                            mb: 3,
                            letterSpacing: '0.5px',
                        }}
                    >
                        Admin Login
                    </Typography>

                    {/* Email field */}
                    <TextField
                        fullWidth
                        name="Email"
                        type="email"
                        placeholder="Email ID"
                        variant="outlined"
                        size="small"
                        value={LogIn.Email}
                        {...errorText('Email')}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#C7C7C7' },
                                '&:hover fieldset': { borderColor: cTheme.primaryFontColor },
                                '&.Mui-focused fieldset': { borderColor: cTheme.primaryBackground },
                            },
                        }}
                    />

                    {/* Password field */}
                    <TextField
                        fullWidth
                        name="Password"
                        type="password"
                        placeholder="Password"
                        variant="outlined"
                        size="small"
                        value={LogIn.Password}
                        {...errorText('Password')}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onSubmit();
                            }
                        }}
                        sx={{
                            mb: 4,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#C7C7C7' },
                                '&:hover fieldset': { borderColor: cTheme.primaryFontColor },
                                '&.Mui-focused fieldset': { borderColor: cTheme.primaryBackground },
                            },
                        }}
                    />

                    {/* Sign in button */}
                    <Button
                        fullWidth
                        disabled={!LogIn.Email.length || !LogIn.Password.length}
                        variant="contained"
                        onClick={onSubmit}
                        sx={{
                            textTransform: "initial",
                            fontWeight: 600,
                            backgroundColor: !LogIn.Email.length || !LogIn.Password.length
                                ? '#D6D6D6'
                                : cTheme.primaryBackground,
                            '&:hover': {
                                backgroundColor: cTheme.primaryFontColor,
                            },
                            py: 1.2,
                            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                            borderRadius: 2,
                        }}
                    >
                        {signInBtnloading
                            ? <CircularProgress sx={{ color: "white" }} size={22} />
                            : 'SIGN IN'}
                    </Button>
                </Paper>
            </div>

            <SnakBarAlert
                alertOpen={alertOpen}
                setAlertOpen={setAlertOpen}
                alertSeverity={alertSeverity}
                alert={alert}
            />
        </>
    );
}
