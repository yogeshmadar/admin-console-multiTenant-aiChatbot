'use client'

import { Button, CircularProgress, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import page from '@/components/sidebar/page.module.css';
import SnakBarAlert from "@/components/snakbarAlert/snackbarAlert";
import React from "react";
import BackDropLoading from "@/components/loading/backDropLoading";
import { cTheme } from "@/theme/colorScheme";

export default function EditUser(props: any) {

    const [editUserBtnloading, setEditUserBtnLoading] = useState<Boolean>(false);
    const [alert, setAlert] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState<Boolean>(false);
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [updateUserData, setUpdateUserData] = useState<any>({
        First_Name: '',
        Last_Name: '',
        Email: '',
        Password: '',
    });
    const [errors, setErrors] = useState({
        First_Name: '',
        Last_Name: '',
        Email: '',
        Password: '',
    });

    const { push } = useRouter();

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        let error = '';
        let maxLength = 50;
        if (value.length <= maxLength) {
            setUpdateUserData({ ...updateUserData, [name]: value });
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

    const onSubmitOfEditUser = async () => {
        const requestBody = {
            first_name: updateUserData.First_Name,
            last_name: updateUserData.Last_Name,
            email: updateUserData.Email,
        }
        try {
            setEditUserBtnLoading(true);
            const response = await fetch(`/api/user/${props.params.admin_users_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            const userResponse = await response.json();

            if (response.status == 200) {
                AlertManager(userResponse?.message, false);
                setEditUserBtnLoading(false);
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
        setEditUserBtnLoading(false);
        setIsPageLoading(false);
    }

    async function getUserById() {
        setIsPageLoading(true);
        try {
            const response = await fetch(`/api/user/${props.params.admin_users_id}`, {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'applicaton/json'
                }
            })
            const getUserById = await response.json();
            if (response.status == 200) {
                setUpdateUserData({
                    ...updateUserData, First_Name: getUserById?.users?.first_name || '',
                    Last_Name: getUserById?.users?.last_name || '',
                    Email: getUserById?.users?.email || '',
                })
                setIsPageLoading(false);
            }
            else {
                AlertManager("Something went wrong", true);
            }
        }
        catch (error: any) {
            AlertManager("Something went wrong", true);
        }
    }

    useEffect(() => {
        getUserById();
    }, [])

    return (
        <div className={`${page["custom-container"]}`} style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'flex-start'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2, mt: "5vh", minHeight: "90vh" }} >
                    <Grid container item xs={12} direction="row" justifyContent={"center"} alignItems={"center"} >
                        <Grid container item xs={12} alignItems="center" justifyContent={'flex-start'} sx={{ mb: 1 }}>
                            <Grid item xs={12}>
                                <Typography variant="body1" sx={{ fontWeight: "700", color: cTheme.primaryFontColor }}> Edit User</Typography>
                            </Grid>
                        </Grid>
                        <Grid container sx={{ borderBottom: "3px solid #F6F5FB", mt: "2vh" }}  > </Grid>
                        <Grid container item xs={12} sm={6} sx={{ color: "#777", m: "5vh", mt: "8vh", }} justifyContent={'space-between'} alignItems={'flex-start'}>
                            <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"} >
                                <Grid container item xs={12} sm={5.7}>
                                    <TextField
                                        fullWidth
                                        name="First_Name"
                                        id="First Name"
                                        type="text"
                                        placeholder="First Name"
                                        size="small"
                                        variant="standard"
                                        value={updateUserData.First_Name}
                                        error={!!errors.First_Name}
                                        helperText={errors.First_Name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        InputProps={{ sx: { maxLength: 51 } }} />
                                </Grid>
                                <Grid container item xs={12} sm={5.7}>
                                    <TextField
                                        fullWidth
                                        name="Last_Name"
                                        id="Last Name"
                                        type="text"
                                        placeholder="Last Name"
                                        size="small"
                                        variant="standard"
                                        value={updateUserData.Last_Name}
                                        error={!!errors.Last_Name}
                                        helperText={errors.Last_Name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        InputProps={{ sx: { maxLength: 51 } }} />
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} justifyContent={"space-between"} alignItems={"center"} sx={{ mt: "6vh" }}>
                                <Grid container item xs={12} sm={5.7}>
                                    <TextField
                                        fullWidth
                                        name="Email"
                                        id="Email"
                                        type="email"
                                        placeholder="Email"
                                        size="small"
                                        variant="standard"
                                        value={updateUserData.Email}
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
                                        disabled={!updateUserData.First_Name.length || !updateUserData.Last_Name.length}
                                        variant="contained"
                                        onClick={onSubmitOfEditUser}
                                        sx={{
                                            backgroundColor: !updateUserData.First_Name.length || !updateUserData.Last_Name.length || !updateUserData.Email.length ? '#F6F5FB' : cTheme.primaryFontColor,
                                            '&:hover': { backgroundColor: cTheme.primaryFontColor+ "!important" }, batextTransform: "initial"
                                        }}
                                    >
                                        {editUserBtnloading ? <CircularProgress sx={{ color: "white" }} size={20} /> : 'Update USER'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={isPageLoading} />
        </div >
    )
}




