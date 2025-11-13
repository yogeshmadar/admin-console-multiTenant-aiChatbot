'use client'

import { Button, CircularProgress, Grid,  TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import page from '@/components/sidebar/page.module.css';
import SnakBarAlert from "@/components/snakbarAlert/snackbarAlert";
import React from "react";
import { cTheme } from "@/theme/colorScheme";

export default function CreateUser() {

    const [isAllUserBtnLoader, setIsAllUserBtnLoader] = useState(false);
    const [createUserBtnloading, setCreateUserBtnLoading] = useState<Boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [createUserData, setCreateUserData] = useState({
        First_Name: '',
        Last_Name: '',
        Email: '',
    });
    const [errors, setErrors] = useState({
        First_Name: '',
        Last_Name: '',
        Email: '',
    });

    const { push } = useRouter();

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = 50;
        if (value.length <= maxLength) {
            setCreateUserData({ ...createUserData, [name]: value });
        } else {
            error = `${name} must be ${maxLength} characters or less`;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleBlur = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        const formattedName = name.replace(/_/g, ' ').replace(/\b\w/g, (char: any) => char.toUpperCase());
        error = value.trim() === '' ? `${formattedName} is required` : '';
        setErrors({ ...errors, [name]: error });
    };

    const onSubmitOfCreateUser = async () => {
        const requestBody = {
            first_name: createUserData.First_Name,
            last_name: createUserData.Last_Name,
            email: createUserData.Email,
        }
        try {
            setCreateUserBtnLoading(true);
            const response = await fetch(`/api/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            const userResponse = await response.json();

            if (response.status == 200) {
                AlertManager(userResponse?.message, false);
                setCreateUserBtnLoading(false);
                push('/admin_users');
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
        setCreateUserBtnLoading(false);
    }


    return (
        <div className={`${page["custom-container"]}`} style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'flex-start'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2, mt: "5vh", minHeight: "90vh" }} >
                    <Grid container item xs={12} direction="row" justifyContent={"center"} alignItems={"center"} >
                        <Grid container item xs={12} sm={9} md={9} lg={10} gap={1.5} direction="row" alignItems="center" justifyContent={'space-between'} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={3.5} md={3.5} lg={2.5} xl={2}  >
                                <Typography variant="body1" sx={{ fontWeight: "700", color: cTheme.primaryFontColor }}> Create User</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} sm={3} md={3} lg={2} justifyContent={"flex-end"} >
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => { setIsAllUserBtnLoader(true); push('/admin_users') }}
                                sx={{ textTransform: "initial", backgroundColor: cTheme.primaryFontColor, borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: cTheme.primaryBackground } }}
                            >
                                {isAllUserBtnLoader ?
                                    <CircularProgress sx={{ color: 'white' }} size={20} /> :
                                    <>
                                        <Typography variant="caption" sx={{ fontWeight: "700" }}>ALL ADMIN USERS</Typography>
                                    </>
                                }
                            </Button>
                        </Grid>
                        <Grid container sx={{ borderBottom: "3px solid #F6F5FB", mt: "2vh" }}  > </Grid>
                        <Grid container item xs={12} sm={6} sx={{ color: "#777", m: "5vh", mt: "8vh", }} justifyContent={'space-between'} alignItems={'flex-start'}>
                            <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"} spacing={3.5}>
                                <Grid container item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="First_Name"
                                        id="First Name"
                                        type="text"
                                        placeholder="First Name"
                                        size="small"
                                        variant="standard"
                                        value={createUserData.First_Name}
                                        error={!!errors.First_Name}
                                        helperText={errors.First_Name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        InputProps={{ sx: { maxLength: 51 } }} />
                                </Grid>
                                <Grid container item xs={12} sm={6}>
                                <TextField
                                        fullWidth
                                        name="Last_Name"
                                        id="Last Name"
                                        type="text"
                                        placeholder="Last Name"
                                        size="small"
                                        variant="standard"
                                        value={createUserData.Last_Name}
                                        error={!!errors.Last_Name}
                                        helperText={errors.Last_Name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        InputProps={{ sx: { maxLength: 51 } }} />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"} sx={{ mt: "6vh" }}>
                                <Grid container item xs={12} sm={12}>
                                    <TextField
                                        fullWidth
                                        name="Email"
                                        id="Email"
                                        type="email"
                                        placeholder="Email"
                                        size="small"
                                        variant="standard"
                                        value={createUserData.Email}
                                        error={!!errors.Email}
                                        helperText={errors.Email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        InputProps={{ sx: { maxLength: 51 } }} />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} sx={{ py: "2vh", my: "9vh" }} justifyContent={"center"} alignItems={"center"}>
                                <Grid item xs={5}>
                                    <Button
                                        fullWidth
                                        disabled={!createUserData.First_Name.length || !createUserData.Last_Name.length || !createUserData.Email.length }
                                        variant="contained"
                                        onClick={onSubmitOfCreateUser}
                                        sx={{
                                            backgroundColor: !createUserData.First_Name.length || !createUserData.Last_Name.length || !createUserData.Email.length  ? '#F6F5FB' : cTheme.primaryFontColor,
                                            '&:hover': { backgroundColor: cTheme.primaryFontColor+" !important" }, batextTransform: "initial"
                                        }}
                                    >
                                        {createUserBtnloading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'CREATE USER'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </div >
    )
}




