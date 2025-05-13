import React from 'react';
import { Container, Typography, Grid, Box, Paper, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { COMPANY_INFO } from '../config';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    margin: theme.spacing(2, 0),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const About = () => {
    return (
        <>
            <Header />
            <Container maxWidth="lg">
                <Box py={6}>
                    <Typography variant="h2" component="h1" gutterBottom align="center" color="primary">
                        {COMPANY_INFO.name}
                    </Typography>
                    <Typography variant="h5" align="center" color="textSecondary" gutterBottom>
                        {COMPANY_INFO.slogan}
                    </Typography>

                    <StyledPaper>
                        <Typography variant="h4" gutterBottom color="primary">
                            Sứ Mệnh
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Chúng tôi cam kết mang đến những giải pháp công nghệ tiên tiến,
                            giúp doanh nghiệp phát triển bền vững trong kỷ nguyên số.
                        </Typography>
                    </StyledPaper>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <StyledPaper>
                                <Typography variant="h4" gutterBottom color="primary">
                                    Tầm Nhìn
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    Trở thành đối tác tin cậy hàng đầu trong lĩnh vực công nghệ,
                                    đóng góp tích cực vào sự phát triển của cộng đồng.
                                </Typography>
                            </StyledPaper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <StyledPaper>
                                <Typography variant="h4" gutterBottom color="primary">
                                    Giá Trị Cốt Lõi
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    - Sáng tạo và đổi mới
                                    - Chất lượng và uy tín
                                    - Hợp tác và phát triển
                                    - Trách nhiệm xã hội
                                </Typography>
                            </StyledPaper>
                        </Grid>
                    </Grid>

                    <StyledPaper>
                        <Typography variant="h4" gutterBottom color="primary">
                            Liên Hệ
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" paragraph>
                                    <strong>Địa chỉ:</strong> {COMPANY_INFO.address}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Điện thoại:</strong> {COMPANY_INFO.phone}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    <strong>Email:</strong> {COMPANY_INFO.email}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    Kết nối với chúng tôi
                                </Typography>
                                <Box>
                                    <Link href={COMPANY_INFO.socialMedia.facebook} target="_blank" rel="noopener" sx={{ mr: 2 }}>
                                        Facebook
                                    </Link>
                                    <Link href={COMPANY_INFO.socialMedia.instagram} target="_blank" rel="noopener" sx={{ mr: 2 }}>
                                        Instagram
                                    </Link>
                                    <Link href={COMPANY_INFO.socialMedia.twitter} target="_blank" rel="noopener">
                                        Twitter
                                    </Link>
                                </Box>
                            </Grid>
                        </Grid>
                    </StyledPaper>
                </Box>
            </Container>
            <Footer />
        </>
    );
};

export default About;
