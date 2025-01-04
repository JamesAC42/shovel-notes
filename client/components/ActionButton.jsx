import styles from '../styles/actionbutton.module.scss';

const ActionButton = ({text, icon, onClick, disabled, highlighted}) => {

    const handleClick = () => {
        if (!disabled) {
            onClick();
        }
    }

    let buttonClass = styles.actionButton;
    if(highlighted) {
        buttonClass += ' ' + styles.highlightedActionButton;
    }

    return (
        <div
            onClick={() => handleClick()}
            className={`${buttonClass} ${disabled ? styles.disabled : ''}`}>
            <span>
                {text}
                {icon}
            </span>
        </div>
    )
}

export default ActionButton;