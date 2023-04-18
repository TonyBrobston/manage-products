'use client'
import {useState} from 'react';
import {Builder, parseString} from 'xml2js';
import CssBaseline from '@mui/material/CssBaseline';
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {Grid, Paper} from '@mui/material';
import {withStyles} from '@mui/styles';
import Home from './home';

const Page = () => {
  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
    spacing: 2,
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Home/>
    </ThemeProvider>
  );
}

export default Page;