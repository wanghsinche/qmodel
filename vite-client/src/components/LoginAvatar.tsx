import { Avatar, Modal, Form, Button, Toast } from '@douyinfe/semi-ui';
import { client } from '../client';
import useSWRMutation from 'swr/mutation'
import swr from 'swr'

interface ILoginModalProps {
    visible: boolean
    onSuccess?: () => void
}

function LoginModal({ visible, onSuccess }: ILoginModalProps) {
    const { trigger: loginMutation, isMutating } = useSWRMutation('loginMutation', async (__, p: { arg: { id: string, brithday: string } }) => {
        let jwt = await client.login.mutate(p.arg)
        if (!jwt) {
            jwt = await client.register.mutate(p.arg)
            Toast.info('注册成功')
        }
        window.localStorage.setItem('token', jwt)
        onSuccess?.()
        return jwt
    })

    return <Modal visible={visible} footer={null} maskClosable={false} closable={false} >
        <Form onSubmit={(p) => {
            const brithday = p.brithday as Date
            const date = brithday.toDateString()

            loginMutation({ ...p, brithday: date })
        }} disabled={isMutating}>
            <Form.Input field="id" label="邮箱" />
            <Form.DatePicker field="brithday" label="出生日期" />
            <Button type="primary" loading={isMutating} htmlType='submit'>进入系统</Button>
        </Form>
    </Modal>
}

export default function LoginAvatar() {
    const { data: profile, isValidating, mutate, isLoading } = swr('profile', async () => {
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

    console.log(notLogin, profile, isValidating, isLoading)
    return <div>
        <Avatar size="medium">{profile?.id}</Avatar>
        <LoginModal onSuccess={() => mutate()} visible={notLogin} />
    </div>
}