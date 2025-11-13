'use client'
import { AppBar, Box, Button, CircularProgress, CssBaseline, Drawer, Fab, Grid, List, ListItem, ListItemButton, ListItemText, SwipeableDrawer, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { usePathname, useRouter } from "next/navigation";
import Image from 'next/image';
import logo from '@/assets/login/logo.png'
import { getSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import page from '@/components/sidebar/page.module.css';
import { cTheme } from "@/theme/colorScheme";


export default function Sidebar({ Children }: any) {
    const [open, setOpen] = useState(false);
    const [isLinkLoading, setIsLinkLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<number | null>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [checkUser, setCheckUser] = useState(false);
    const sidebarItems = ['/chatbots', '/message_threads', '/admin_users']

    const pathname = usePathname();
    const { push } = useRouter();
    const drawerWidth = "17.35vw";

    const handleItemClick = (index: number) => {
        if (pathname !== sidebarItems[index]) {
            setIsLoading(true);
            push(sidebarItems[index] ?? '');
            setSelectedItem(index);
            setCookie('selectedItem', index.toString());
        }
    };

    const getSelectedItemFromCookies = () => {
        const storedItem = getCookie('selectedItem');
        const currentIndex = sidebarItems.findIndex(v => v === pathname)
        if (Number(storedItem) !== currentIndex) {
            setCookie('selectedItem', currentIndex.toString())
        }
        return currentIndex
    };

    useEffect(() => {
        setSelectedItem(getSelectedItemFromCookies());
        async function handleSidebarDisplay() {
            const session = await getSession();
            if (!session?.user) return setCheckUser(true);
            setCheckUser(false);
        }
        handleSidebarDisplay();
    }, [pathname]);

    useEffect(() => {
        const loadertimeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(loadertimeout);
    }, [pathname]);

    const toggleDrawer = (openState: any) => (event: any) => {
        if (
            event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setOpen(openState);
    };

    var LogoImage = <ListItem onClick={toggleDrawer(false)} >
        <Grid container sx={{ my: "1vh" }} justifyContent={'center'} alignItems={'center'} >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}  >
                <Image src={logo}
                    priority={true}
                    placeholder="empty"
                    alt="Chatbots"
                    style={{
                        objectFit: 'contain',
                        backgroundColor: "transparent",
                        borderRadius: "1vh",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto"
                    }}
                    unoptimized
                />
            </div>
        </Grid>
    </ListItem>

    return (
        <>
            {pathname == '/sign-in' || checkUser ? null :
                <div className={page["hidden-lg-block"]} >
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex' }}>
                            <CssBaseline />
                            <AppBar
                                position="fixed"
                                sx={{ width: "17.35vw", ml: "0.026" }}
                            >
                            </AppBar>
                            <Drawer
                                sx={{
                                    width: drawerWidth,
                                    flexShrink: 0,
                                    '& .MuiDrawer-paper': {
                                        width: drawerWidth,
                                        backgroundColor: "#CEDF9F",
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    },
                                }}
                                variant="permanent"
                                anchor="left"
                            >
                                <List sx={{ backgroundColor: "#CEDF9F", px: 2 }}>
                                    {LogoImage}
                                    {pathname == '/sign-in' ? null :
                                        <List>
                                            {["Chatbots", "Message Threads", "Admin Users"].map((text, index) => (
                                                <ListItem key={text} sx={{
                                                    color: "white",
                                                    "&:hover": { backgroundColor: cTheme.primaryBackground },
                                                    backgroundColor: selectedItem === index ? cTheme.primaryBackground : null,
                                                    borderRadius: "1vh",
                                                    p: "1.2vh", mb: "1vh", mt: "0.5vh",
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <ListItemButton
                                                        sx={{ "&:hover": { backgroundColor: "transparent" }, p: 0, m: 0 }}
                                                        onClick={() => handleItemClick(
                                                            index
                                                        )} >
                                                        <ListItemText
                                                            sx={{
                                                                margin: "0"
                                                            }}
                                                        >
                                                            {text}
                                                        </ListItemText>
                                                        {selectedItem === index && isLoading &&
                                                            <div>
                                                                <CircularProgress sx={{ color: "white" }} size={18} />
                                                            </div>}
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    }
                                </List>
                                {pathname == '/sign-in' ? null :
                                    <Grid container sx={{ width: "100%", height: "3.399vw", my: "1.965vw", display: 'flex', justifyContent: "center", alignItems: "center" }}
                                        onClick={() => {
                                            deleteCookie('chatbot_access_token');
                                            deleteCookie('first_name');
                                            deleteCookie('last_name');
                                            deleteCookie('selectedItem');
                                            signOut({ callbackUrl: '/' });
                                            setIsLinkLoading(true);
                                        }}>
                                        &nbsp;<Button variant="contained" className="cursor-pointer" sx={{ textTransform: "initial", backgroundColor: cTheme.primaryBackground, color: "white", width: '80%', '&:hover': { backgroundColor: cTheme.primaryFontColor } }}>
                                            {isLinkLoading ? <CircularProgress sx={{ color: "white" }} size={25} /> : 'SIGN OUT'}
                                        </Button>
                                    </Grid>
                                }
                            </Drawer>
                            <Box
                                component="main"
                                sx={{ flexGrow: 1, bgcolor: '#F6F5FB' }}
                            >
                                {Children}
                            </Box>
                        </Box>
                    </div >
                </div >
            }
            {pathname == '/sign-in' ? null :
                <div className={page["block-lg-hidden"]}>
                    <div>
                        <SwipeableDrawer
                            anchor="left"
                            open={open}
                            onClose={toggleDrawer(false)}
                            onOpen={toggleDrawer(true)}
                        >
                            <List className={`${page["list-container"]}`} sx={{ height: '100%', backgroundColor: cTheme.primaryFontColor, }}>
                                <Grid>
                                    {LogoImage}
                                    {pathname == '/sign-in' ? null :
                                        <List>
                                            {["Chatbots", "Message Threads", "Admin Users"].map((text, index) => (
                                                <ListItem key={text} disablePadding>
                                                    <ListItemButton
                                                        sx={{ "&:hover": { backgroundColor: "transparent" }, p: 0, m: 0 }}
                                                        onClick={() => handleItemClick(
                                                            index
                                                        )} >
                                                        <ListItemText
                                                            primary={text}
                                                            sx={{
                                                                color: "white",
                                                                "&:hover": { backgroundColor: cTheme.primaryBackground },
                                                                backgroundColor: selectedItem === index ? cTheme.primaryBackground : null,
                                                                borderRadius: "1vh",
                                                                p: "1.2vh", mb: "1vh"
                                                            }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    }
                                </Grid>
                                {pathname == '/sign-in' ? null :
                                    <Grid container sx={{ width: "100%", height: "3.399vw", my: "1.965vw", display: 'flex', justifyContent: "center", alignItems: "center" }}
                                        onClick={() => {
                                            deleteCookie('chatbot_access_token');
                                            signOut({ callbackUrl: '/' });
                                            setIsLinkLoading(true);
                                        }}>
                                        &nbsp;<Button variant="contained" className="cursor-pointer" sx={{ textTransform: "initial", backgroundColor: cTheme.primaryBackground, color: "white", width: '80%', '&:hover': { backgroundColor: cTheme.primaryFontColor } }}>
                                            {isLinkLoading ? <CircularProgress sx={{ color: "white" }} size={25} /> : 'SIGN OUT'}
                                        </Button>
                                    </Grid>
                                }
                            </List>
                        </SwipeableDrawer>
                        <Fab
                            aria-label="menu"
                            onClick={() => { setOpen(!open) }}
                            sx={{
                                position: 'fixed',
                                bottom: '16px',
                                left: '16px',
                                zIndex: 1300,
                                backgroundColor: "white",
                            }}
                        >
                            <MenuIcon sx={{ color: '#2A2F42', fontWeight: '600' }} />
                        </Fab>
                    </div>
                </div>
            }
        </>
    )
}
