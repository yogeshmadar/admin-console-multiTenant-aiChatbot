'use client'

import { Button, CircularProgress, Grid, InputAdornment, Pagination, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from "next/navigation";
import SearchIcon from '@mui/icons-material/Search';
import Cards from "@/components/chatbotCard";
import page from '@/components/sidebar/page.module.css';
import SnakBarAlert from "@/components/snakbarAlert/snackbarAlert";
import BackDropLoading from "@/components/loading/backDropLoading";
import { cTheme } from "@/theme/colorScheme";
// TODO: Need to refactor this component
export default function ChatBox() {

    const [isNewChatbotBtnLoader, setIsNewChatbotBtnLoader] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [allChatbots, setAllChatbots] = useState<any>([]);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [alertSeverity, setAlertSeverity] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredAllChatbotsItems, setFilteredAllChatbotsItems] = useState<any>([])

    const itemsPerPage = 8;
    const { push } = useRouter();

    async function getAllChatbotsAPI() {
        try {
            setPageLoading(true);
            const response = await fetch(`/api/chatbots`, {
                method: 'GET',
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const getAllChatbotResponse = await response.json();

            if (response.status == 200) {
                setTotalItems((getAllChatbotResponse?.data).length);
                setAllChatbots(getAllChatbotResponse?.data);
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
        getAllChatbotsAPI();
    }, [])

    useEffect(() => {
        var calculateTotalPage = Math.ceil(filteredAllChatbotsItems.length / itemsPerPage);
        setTotalPage(calculateTotalPage);
    }, [filteredAllChatbotsItems, itemsPerPage]);

    //Pagination 
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    useEffect(() => {
        setCurrentPage(1);
        const items = searchQuery === '' ? allChatbots : allChatbots.filter((item: any) => {
            return item.bot_name.toLowerCase().includes(searchQuery.toLowerCase());
        });
        setFilteredAllChatbotsItems(items)
    }, [searchQuery, allChatbots])

    const displayedItems = filteredAllChatbotsItems.slice(startIndex, endIndex);


    return (
        <div className={`${page["custom-container"]}`} style={{ backgroundColor: "#F6F5FB", minHeight: '100vh' }}>
            <Grid container item xs={12} justifyContent={'flex-start'} alignItems={'center'} sx={{ pl: 3 }}>
                <Grid container item xs={11.5} alignItems={'center'} justifyContent={'center'} sx={{ backgroundColor: 'white', borderRadius: '2vh', p: 2, mt: "5vh" }} >
                    <Grid container item xs={12} direction="row" justifyContent={"center"} alignItems={"center"} >
                        <Grid container item direction="row" alignItems="center" xs={12} sm={9} md={9} lg={10} gap={1.5} justifyContent={'space-between'} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={3.5} md={3.5} lg={2.5} xl={2}  >
                                <Typography variant="body1" sx={{ fontWeight: "700", color: cTheme.primaryFontColor }}> CHATBOTS</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} sm={3} md={3} lg={2} justifyContent={"flex-end"} >
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => { setIsNewChatbotBtnLoader(true); push('/chatbots/create') }}
                                sx={{ textTransform: "initial", backgroundColor: cTheme.primaryFontColor, borderRadius: "1vh !important", color: "#F0F2FF", fontWeight: "700", p: "1.2vh", '&:hover': { backgroundColor: cTheme.primaryBackground } }}
                            >
                                {isNewChatbotBtnLoader ?
                                    <CircularProgress sx={{ color: 'white' }} size={20} /> :
                                    <>
                                        <AddIcon fontSize="medium" sx={{ display: 'flex', m: 0, marginRight: "1vh" }} />
                                        <Typography variant="caption" sx={{ fontWeight: "700" }}>CREATE CHATBOT</Typography>
                                    </>
                                }
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid container sx={{ borderBottom: "3px solid #F6F5FB", mt: "2vh" }} > </Grid>
                    <Grid container item xs={12} justifyContent={'center'} alignItems={'center'} sx={{ mt: "3vh" }}>
                        <Grid item xs={10} sm={8} md={4} lg={4} xl={4} sx={{ height: "100%" }}>
                            <TextField
                                fullWidth
                                size='small'
                                variant="standard"
                                value={searchQuery}
                                placeholder="Search"
                                onChange={(e: any) => setSearchQuery(e.target.value)}
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
                    <Grid container item xs={12} sm={8.5} md={11.5} lg={8.5} direction={'row'} sx={{ minHeight: "59vh", py: "1.5vh", mt: "3vh" }} justifyContent={"flex-start"} alignItems={'flex-start'} >
                        <Grid container item md={12} gap={2} justifyContent={"flex-start"} alignItems={'flex-start'}  >
                            {
                                displayedItems.map((itm: any, i: any) => {
                                    return <Cards key={i} item={itm} />
                                })
                            }
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ my: "3vh" }}>
                        <Grid item xs={12}>
                            <PaginationSection currentPage={currentPage} count={totalPage} handlePagination={(event: any, value: number) => { setCurrentPage(value); }} shape="rounded" />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <SnakBarAlert alertOpen={alertOpen} setAlertOpen={setAlertOpen} alertSeverity={alertSeverity} alert={alert} />
            <BackDropLoading isLoading={pageLoading} />
        </div>

    )
}


//Pagnation Component
const PaginationSection = (props: any) => {
    return (
        <Stack spacing={1}>
            <Pagination

                sx={{
                    '& .MuiPaginationItem-root': { fontWeight: "500", borderRadius: "1.1vh" },
                    '& ul': { justifyContent: 'center' },
                    '& .Mui-selected': { backgroundColor: '#F6F5FB', color: 'black', fontWeight: "700" },
                    '& .MuiPaginationItem-previousNext': { mx: "3vh", backgroundColor: '#F6F5FB', borderRadius: "1.1vh" },
                }}
                showFirstButton showLastButton
                size='medium'
                shape="rounded"
                count={props.count} page={props.currentPage} onChange={props.handlePagination} />
        </Stack>
    )
}