'use client'

import * as React from 'react';
import { Grid, InputAdornment, TextField, Typography } from '@mui/material';
import pages from '@/components/sidebar/page.module.css';
import TableComponent from '@/components/table/tablecomponent';
import { useState } from 'react';
import SnakBarAlert from '@/components/snakbarAlert/snackbarAlert';
import BackDropLoading from '@/components/loading/backDropLoading';
import { json } from 'node:stream/consumers';
import SearchIcon from '@mui/icons-material/Search';
import _ from 'lodash';
import useSearch from '@/hooks/useSearch';
import { cTheme } from '@/theme/colorScheme';

export default function MessageTreads() {

    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [pageLoading, setPageLoading] = useState(false);
    const [allMessageThreads, setAllMessageThreads] = useState([]);
    const [totalCount, setTotalCount] = useState();
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('')

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const headers = ["Chatbot Name", "Name", "Phone", "Email", "Created at", "Total Conversation", "Likes", "Dislikes", "Action"]

    async function getAllMessageThreadsAPI(filter?: string) {
        const requestBody = {
            page: page + 1,
            limit: rowsPerPage,
            filter
        }
        try {
            setPageLoading(true);
            const response = await fetch(`/api/message-threads`, {
                method: 'POST',
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })
            const getAllMessageThreadsResponse = await response.json();
            if (response.status == 200) {
                setAllMessageThreads(getAllMessageThreadsResponse?.data);
                setTotalCount(getAllMessageThreadsResponse?.total_count);
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

    useSearch(()=>{
        setFilter(search)
        setPage(0)
    }, [search])

    function AlertManager(message: string, severity: boolean) {
        setAlert(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
        setPageLoading(false);
    }

    React.useEffect(() => {
        getAllMessageThreadsAPI(filter);
    }, [page,rowsPerPage, filter])

    const handleSearch = (e: any) => {
        setSearch(e.target.value)
    }   

    return (
        <div className={`${pages["custom-container"]}`} style={{ backgroundColor: "#F6F5FB", paddingBottom: '5vh', minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'flex-start'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 3, mt: "5vh", minHeight: "90vh" }} >
                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} >
                        <Grid container item xs={12} alignItems="center" justifyContent={'flex-start'} sx={{ mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: "700", color: cTheme.primaryFontColor }}> Message Threads</Typography>
                        </Grid>
                        <Grid container sx={{ borderBottom: "3px solid #F6F5FB", mt: "2vh" }}  > </Grid>
                        <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ mt: "3vh" }}>
                        <Grid item xs={10} sm={8} md={4} lg={4} xl={4} sx={{ height: "100%" }}>
                            <TextField
                                fullWidth
                                size='small'
                                variant="standard"
                                value={search}
                                placeholder="Search"
                                onChange={handleSearch}
                                InputProps={{
                                    sx: {
                                        borderRadius: "1.5vh", maxLength: 51, border: 'none',
                                        "& input::placeholder": { fontSize: "14px", fontWeight: "700" },
                                    },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                    </Grid>
                        <TableComponent
                            page={page}
                            rowsPerPage={rowsPerPage}
                            setPage={setPage}
                            setRowsPerPage={setRowsPerPage}
                            handleChangePage={handleChangePage}
                            handleChangeRowsPerPage={handleChangeRowsPerPage}
                            rows={allMessageThreads}
                            rowsLength={totalCount}
                            headersName={headers}
                            pageName="MessageThreads"
                             />
                    </Grid>
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={pageLoading} />
        </div >

    );
}