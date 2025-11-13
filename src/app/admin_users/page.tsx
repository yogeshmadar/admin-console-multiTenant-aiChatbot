'use client'

import * as React from 'react';
import { Button, CircularProgress, Grid, Typography } from '@mui/material';
import pages from '@/components/sidebar/page.module.css';
import TableComponent from '@/components/table/tablecomponent';
import { useEffect, useState } from 'react';
import SnakBarAlert from '@/components/snakbarAlert/snackbarAlert';
import BackDropLoading from '@/components/loading/backDropLoading';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { cTheme } from '@/theme/colorScheme';

export default function AdminUsers() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [isNewUserBtnLoader, setIsNewUserBtnLoader] = useState(false);
    const [reloadTableLoader, setReloadTableLoader] = useState(false);
    const [totalCount, setTotalCount] = useState();

    const headers = ["Name", "Email", "Signed Up", "Status", "Action"]
    const { push } = useRouter();
    async function getAllUsersAPI() {
        try {
            const payload = {
                page: page+ 1,
                limit: rowsPerPage
            }
            setPageLoading(true);
            const response = await fetch(`/api/user/all`, {
                method: 'POST',
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            })
            const getAllusersResponse = await response.json();
            if (response.status == 200) {
                setAllUsers(getAllusersResponse?.users);
                setTotalCount(getAllusersResponse?.total_count);
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
        getAllUsersAPI();
    }, [page, rowsPerPage, !reloadTableLoader])

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <div className={`${pages["custom-container"]}`} style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'flex-start'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 3, mt: "5vh", minHeight: "90vh" }} >
                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} >
                        <Grid container item direction="row" alignItems="center" xs={12} sm={9} md={9} lg={10} gap={1.5} justifyContent={'space-between'} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={3.5} md={3.5} lg={2.5} xl={2}  >
                                <Typography variant="body1" sx={{ fontWeight: "700", color: cTheme.primaryFontColor }}> Admin Users</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} sm={3} md={3} lg={2} justifyContent={"flex-end"} >
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => { setIsNewUserBtnLoader(true); push('/admin_users/create') }}
                                sx={{ textTransform: "initial", backgroundColor: cTheme.primaryFontColor, borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: cTheme.primaryBackground } }}
                            >
                                {isNewUserBtnLoader ?
                                    <CircularProgress sx={{ color: 'white' }} size={25} /> :
                                    <>
                                        <AddIcon fontSize="medium" sx={{ display: 'flex', m: 0, marginRight: "1vh" }} />
                                        <Typography variant="caption" sx={{ fontWeight: "700" }}>CREATE USER</Typography>
                                    </>
                                }
                            </Button>
                        </Grid>
                        <Grid container sx={{ borderBottom: "3px solid #F6F5FB", mt: "2vh" }}  > </Grid>
                        <TableComponent
                            page={page}
                            rowsPerPage={rowsPerPage}
                            setPage={setPage}
                            setRowsPerPage={setRowsPerPage}
                            handleChangePage={handleChangePage}
                            handleChangeRowsPerPage={handleChangeRowsPerPage}
                            rows={allUsers}
                            rowsLength={totalCount}
                            headersName={headers}
                            reloadTableLoader={reloadTableLoader}
                            setReloadTableLoader={setReloadTableLoader}
                            pageName='AdminUsers'
                        />
                    </Grid>
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={pageLoading} />
        </div >
    );
}