import { Avatar, Modal, Form, Button, Toast, Popconfirm, Space } from '@douyinfe/semi-ui';
import { client } from '../client';
import useSWRMutation from 'swr/mutation'
import swr from 'swr'
import { useRef, useState } from 'react';
import { FormApi } from '@douyinfe/semi-ui/lib/es/form';
import { format } from 'date-fns'
interface ILoginModalProps {
    visible: boolean
    onSuccess?: () => void
}

function LoginModal({ visible, onSuccess }: ILoginModalProps) {
    const loginMutation = useSWRMutation('loginMutation', async (__, p: { arg: { id: string, brithday: string } }) => {
        let jwt = await client.login.mutate(p.arg)
        if (!jwt) {
            Toast.error('用户或生日错误')
            return 
        }
        window.localStorage.setItem('token', jwt)
        onSuccess?.()
        return jwt
    })
    const registerMutation = useSWRMutation('registerMutation', async (__, p: { arg: { id: string, brithday: string } }) => {
        let jwt = await client.login.mutate(p.arg)
        if (!jwt) {
            jwt = await client.register.mutate(p.arg)
            Toast.info('注册成功')
        }
        window.localStorage.setItem('token', jwt)
        onSuccess?.()
        return jwt
    })

    const formAPIRef = useRef<FormApi>()

    const [accountId, setAccountId] = useState('')

    const checkResult = swr(['checkResult', accountId], async () => {
        if (!accountId) {
            return null
        }
        return await client.checkAccountUsed.query(accountId)
    })

    const isLoading = checkResult.isValidating || loginMutation.isMutating || registerMutation.isMutating

    const userExisting = checkResult.data

    

    return <Modal visible={visible} footer={null} maskClosable={false} closable={false}  >
        <Form

            getFormApi={(api) => formAPIRef.current = api}
            onSubmit={(p) => {
                const brithday = p.brithday as Date
                const date = format(brithday, 'yyyy-MM-dd')
                if (userExisting) {
                    loginMutation.trigger({ id: accountId, brithday: date })
                    return
                }
                registerMutation.trigger({ id: accountId, brithday: date })

            }} disabled={isLoading}>
            <Form.Input field="id" placeholder="邮箱" noLabel onBlur={(e) => setAccountId(e.target.value)} rules={[{ required: true }]} fieldStyle={{paddingBottom:0}} noErrorMessage/>
            <Form.DatePicker field="brithday" placeholder="出生日期" noLabel rules={[{ required: true }]} style={{ width: '100%' }} noErrorMessage/>

            {userExisting && <Button type="primary" theme='solid' loading={isLoading} htmlType='submit' >进入系统</Button>}
            {!userExisting && <Popconfirm content="确认邮箱和生日，一旦注册，无法修改" onConfirm={() => {
                formAPIRef.current?.submitForm()
            }}>
                <Button type="primary" theme='solid' loading={isLoading} >进入系统</Button>
            </Popconfirm>}

        </Form>
    </Modal>
}

export default function LoginAvatar() {
    const { data: profile, mutate, isLoading } = swr('profile', async () => {
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

    const notLogin = !profile && !isLoading

    const logout = () => {
        window.localStorage.removeItem('token')
        mutate()
    }

    return <div>
        {!notLogin && <Space style={{display: 'flex', flexDirection: 'row-reverse'}}>
            <Button type="tertiary" onClick={logout} theme='borderless' >退出</Button>
            <Avatar size="small">{profile?.id.slice(0, 2)}</Avatar>        
        </Space>}
       
        <LoginModal onSuccess={() => mutate()} visible={notLogin} />
    </div>
}