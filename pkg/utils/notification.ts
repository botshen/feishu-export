import { Minute } from "../common"
import { Toast } from "../lark"


export const confirm = (): Promise<boolean> => {
  return new Promise<boolean>(resolve => {
    let confirmed = false

    Toast.info({
      closable: true,
      duration: Minute,
      content: 'continue',
      actionText: 'confirm',
      onActionClick: () => {
        confirmed = true
      },
      onClose: () => {
        resolve(confirmed)
      },
    })
  })
}
