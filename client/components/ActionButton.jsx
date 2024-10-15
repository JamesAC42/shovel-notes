import styles from '../styles/actionbutton.module.scss';

const ActionButton = ({text, icon, onClick}) => {
    return (
        <div
            onClick={onClick}
            className={styles.actionButton}>
            <span>
                {text}
                {icon}
            </span>
        </div>
    )
}

export default ActionButton;