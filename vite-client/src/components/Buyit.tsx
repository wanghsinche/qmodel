import { Button, Modal } from '@douyinfe/semi-ui';
import { client } from '../client';
import useSWRMutation from 'swr/mutation'

interface IProps {
    priceId?: string
}

export default function Buyit({ priceId = 'price_1N2XoVFMVPfRQBio0ssgiFga' }: IProps) {
    const { trigger: createCheckoutSessionMutation, isMutating } = useSWRMutation('createCheckoutSessionMutation', async () => {
        const resultURL = new URL(window.location.href)
        resultURL.pathname = '/payment_result'
        const session = await client.getCheckoutSession.mutate({ priceId, quantity: 1, resultURL: resultURL.toString() })
        if (session?.url) {
            window.open(session.url)
            Modal.info({
                title: 'Payment', content: 'Checkout session created. Please pay with Stripe.', cancelText: 'Pay Later', 
                okText: 'Paid'
            })
        }
    })

    return (
        <Button type="primary" style={{color: 'var(--semi-orange-3)'}} loading={isMutating} onClick={() => createCheckoutSessionMutation()}>赞助我</Button>
    )
}