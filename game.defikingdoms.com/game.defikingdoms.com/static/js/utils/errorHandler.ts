import { dispatch } from 'features'
import { addPopup } from 'features/application/actions'

export default function (error: any, defaultError?: string, targetError?: string, targetCallback?: Function) {
  console.error(error)
  if (error.data && error.data.message) {
    const errorMessage = error.data.message
    console.log(error)
    let finalError = defaultError || errorMessage

    switch (errorMessage) {
      case 'execution reverted: sterile':
        finalError = 'One of your selected heroes has no additional summons available. Please select a new hero.'
        break
      case 'execution reverted: parent':
        finalError =
          'Heroes are unable to summon with a hero that helped summon them. Please select a new pair of heroes.'
        break
      case 'execution reverted: sibling':
        finalError =
          'Heroes are unable to summon with other heroes who were summoned by the same summoner. Please select a new pair of heroes.'
        break
      case 'execution reverted: not enough tears':
        finalError = "Insufficient balance of Gaia's Tears."
        break
      case 'execution reverted: ERC20: transfer amount exceeds balance':
        finalError = "You don't have enough tokens and/or items to complete the transaction."
        break
      case 'execution reverted: cooldown':
        finalError = 'One of the selected heroes is currently in cooldown. Please try again after cooldown is complete.'
        break
      case 'execution reverted: not ready to open':
        finalError = 'There is a cooldown before you can open this item. Please try again shortly.'
        break
      case 'execution reverted: already questing':
        finalError = 'This hero is already on a quest and must complete it before starting a new one'
        break
      case 'execution reverted: not enough time':
        finalError = 'There is a cooldown before you can complete this quest. Please try again shortly.'
        break
      case 'execution reverted: too much time':
        finalError = 'This quest is already completed. Please select Complete or claim from the original quest modal.'
        break
      case 'execution reverted: not enough gold':
        finalError = 'You do not have enough gold to make this purchase.'
        break
      case 'execution reverted: no meditation':
        finalError = 'This hero is not currently meditating.'
        break
      case 'execution reverted: invalid attunement Item':
        finalError = 'The currently selected attunement item is not valid.'
        break
      case 'execution reverted: already used':
        finalError = 'This can only be used once per hero.'
        break
      case 'execution reverted: not on auction':
        finalError = 'The selected token is not currently on auction.'
        break
      case 'execution reverted: not available':
        finalError = 'The stone carver is not currently available for this action.'
        break
      case targetError:
        return targetCallback && targetCallback()
    }

    dispatch(addPopup({ content: { error: finalError } }))
  } else if (defaultError) {
    dispatch(addPopup({ content: { error: defaultError } }))
  }
}
