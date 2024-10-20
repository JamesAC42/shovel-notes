import styles from '../styles/actionbutton.module.scss';

const ActionButton = ({text, icon, onClick, disabled}) => {

    const handleClick = () => {
        if (!disabled) {
            onClick();
        }
    }

    return (
        <div
            onClick={() => handleClick()}
            className={`${styles.actionButton} ${disabled ? styles.disabled : ''}`}>
            <span>
                {text}
                {icon}
            </span>
        </div>
    )
}

export default ActionButton;