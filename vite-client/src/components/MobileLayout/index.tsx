import { Layout, Nav, Button, Typography, Space } from '@douyinfe/semi-ui';
import { IconChevronLeft } from '@douyinfe/semi-icons';
import './mobileStyle.css';
import { useNavigate } from 'react-router-dom';
import LoginAvatar from '../LoginAvatar';
import Buyit from '../Buyit';
import useSWR from 'swr';
import { client } from '../../client';
import { ReactNode } from 'react';
const { Header, Content, Footer } = Layout;
const { Text } = Typography;

interface IProps {
  children?: React.ReactNode;
  onBack?: () => void;
  title?: ReactNode;
  showBack?: boolean;
}
const MobileFirstLayout = ({
  children,
  title = 'qmodel',
  showBack = true,
  onBack = () => { },
}: IProps) => {
  const nav = useNavigate()
  const handleBack = () => {
    // Add your back navigation logic here
    nav(-1)
    onBack();
  };

  const { data: profile } = useSWR('profile', async () => {
    const jwt = window.localStorage.getItem('token')
    if (!jwt) {
        return null
    }
    try {
        const user = await client.getProfile.query();
        if (!user) {
            return null
        }
        return user
    } catch (error) {
        console.info(error)
        return null
    }
})




  const backButton = showBack && <Button
    icon={<IconChevronLeft />}
    theme="borderless"
    style={{ color: 'var(--semi-color-text-2)' }}
    onClick={handleBack}
  />
  return (
    <Layout className="mobile-first-layout">
      <Header className="navbar">
        <Nav
          mode="horizontal"
          header={
            <Space>
              {backButton}
              <Text style={{ marginLeft: '16px', color: 'var(--semi-color-text-0)' }}>
                {title}
              </Text>
            </Space>
          }
          footer={
            <Space>
              {profile && <Buyit />}
              <LoginAvatar />
            </Space>

          }
        />
      </Header>
      <Content className="content">
        {children}
      </Content>
      <Footer className="footer">
        <Text type="secondary">&copy; {new Date().getFullYear()} {TITLE}. All rights reserved.</Text>
      </Footer>

    </Layout>
  );
};

export default MobileFirstLayout;