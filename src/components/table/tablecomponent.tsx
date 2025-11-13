'use client'

import { CircularProgress, Grid, Link, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material"
import Brightness1Icon from '@mui/icons-material/Brightness1';
import { useRouter } from "next/navigation";
import DateFormats from "@/util/dateFormats";
import { setCookie } from "cookies-next";
import { useState } from "react";
import SnakBarAlert from "../snakbarAlert/snackbarAlert";
import { cTheme } from "@/theme/colorScheme";

export default function TableComponent(props: any) {
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [editLoader, setEditLoader] = useState(false);
    const [viewLoader, setViewLoader] = useState(false);
    const [activeLoader, setAcitveLoader] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number| null>(null);
    const { push } = useRouter();

    async function deleteUserAPI(ActiveMsg: boolean, userId: string) {
        const requestBody = {
            is_active: !ActiveMsg,
        }
        try {
            const response = await fetch(`/api/user/${userId}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })
            const userDeleteResponse = await response.json();
            if (response.status == 200) {
                AlertManager(userDeleteResponse?.message, false);
                props.setReloadTableLoader(!props.reloadTableLoader);
               setAcitveLoader(false)
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
        setAcitveLoader(false)
    }

    return (
        <>
            <Grid container item xs={12} sm={10} sx={{ color: "#777", m: "5vh", mt: "8vh", flexDirection: 'column', position: 'relative' }}>
                <TableContainer sx={{ flex: '1 1 auto', marginBottom: '16px' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {
                                    props.headersName.map((name: any, i: number) => {
                                        return <TableCell key={i} align="left" sx={{ fontWeight: "600" }}>{name}</TableCell>
                                    })
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props.rows
                                .map((row: any, i: number) => (
                                    <TableRow
                                        key={i}
                                        sx={{
                                            '&:last-child td, &:last-child th': {
                                                borderBottom: '1px solid #ddd',
                                                borderLeft: 0,
                                                borderRight: 0,
                                            },
                                        }}>
                                        {!(props?.pageName == 'AdminUsers') ?
                                            <TableCell align="left">{row?.bot_name}</TableCell> : null}
                                        <TableCell component="th" scope="row">
                                            {row?.first_name} {row?.last_name}
                                        </TableCell>
                                        {
                                            (props?.pageName == 'MessageThreads') && (
                                                <TableCell align="left">{row?.phone}</TableCell>
                                            )
                                        }
                                        <TableCell align="left">{row?.email}</TableCell>
                                        <TableCell align="left">{DateFormats(row?.created_date, false)} </TableCell>
                                        <TableCell align={props?.pageName === 'AdminUsers' ? "left" : "center"}>
                                            {props?.pageName === 'AdminUsers' ? (
                                                <>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                        <Brightness1Icon
                                                            fontSize="small"
                                                            sx={{ color: row?.is_active == true ? "#6EE3AB" : "#EDD86D", p: "0.5vh" }}
                                                        />
                                                        <Typography sx={{ marginLeft: '4px' }}>{row?.is_active == true ? 'Active' : "Inactive"}</Typography>
                                                    </div>
                                                </>
                                            ) : <Typography >{row?.messages_count}</Typography>}
                                        </TableCell>
                                        {(props?.pageName == 'MessageThreads') && <TableCell align="left"><Typography >{row?.likes}</Typography></TableCell>}
                                        {(props?.pageName == 'MessageThreads') && <TableCell align="left"><Typography >{row?.dislikes}</Typography></TableCell>}
                                        <TableCell align="left">{
                                            props.pageName == 'AdminUsers' ?
                                                <>
                                                    <Grid container direction='row' item xs={12} justifyContent={"center"} alignItems={'center'}>
                                                        <Grid container item xs={6} justifyContent={"flex-start"}>
                                                            <Link
                                                                component="button"
                                                                variant="body1"
                                                                underline="none"
                                                                onClick={() => {setSelectedIndex(i); setAcitveLoader(true); deleteUserAPI(row?.is_active, row?.user_id) }}
                                                                sx={{ fontWeight: "600", mr: "2vh", color: cTheme.primaryFontColor }}
                                                            >
                                                               {activeLoader && selectedIndex == i ? <CircularProgress size={18} sx={{color: cTheme.primaryFontColor }}/> :
                                                                    row?.is_active == true ? 'Active' : "Deactive"} 
                                                            </Link>
                                                        </Grid>
                                                        <Grid container item xs={6} justifyContent={'flex-end'}>
                                                            <Link
                                                                component="button"
                                                                variant="body1"
                                                                underline="none"
                                                                onClick={() => { setEditLoader(true);setSelectedIndex(i); push(`/admin_users/${row?.user_id}`) }}
                                                                sx={{ fontWeight: "600", color: cTheme.primaryFontColor }}
                                                            >
                                                                {editLoader && selectedIndex == i ? <CircularProgress size={18} sx={{color: cTheme.primaryFontColor }}/> :
                                                                    "Edit"}
                                                            </Link>
                                                        </Grid>
                                                    </Grid>
                                                </>
                                                : <Link
                                                    component="button"
                                                    variant="body1"
                                                    underline="none"
                                                    onClick={() => {setViewLoader(true);setSelectedIndex(i); setCookie('first_name', row?.first_name); setCookie('last_name', row?.last_name); push(`/message_threads/${row?.bot_id}/${row?.thread_id}`) }}
                                                    sx={{ color: cTheme.primaryFontColor, fontWeight: "600" }}
                                                >
                                                    {viewLoader && (selectedIndex == i) ? <CircularProgress size={18} sx={{color: cTheme.primaryFontColor }}/> :
                                                                    "view"}
                                                </Link>
                                        }
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Grid container justifyContent="flex-end">
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={props?.rowsLength ?? 0}
                        rowsPerPage={props?.rowsPerPage}
                        page={props?.page ?? 0}
                        onPageChange={props?.handleChangePage}
                        onRowsPerPageChange={props?.handleChangeRowsPerPage}
                    />
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
        </>
    )
}