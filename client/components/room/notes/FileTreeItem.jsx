import React, { useState, useRef, useEffect } from 'react';
import styles from '../../../styles/room/notes/notesnavigation.module.scss';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';

const FileTreeItem = ({ item, level, onUpdate, onContextMenu }) => {

    const [isOpen, setIsOpen] = useState(false);
    const itemRef = useRef(null);
  
    const toggleOpen = (e) => {
      if (item.is_folder) {
        setIsOpen(!isOpen);
      }
    };
    const handleContextMenu = (e) => {
      const { clientX, clientY } = e;
      onContextMenu(e, item, { x: clientX, y: clientY });
    };
  
    return (
      <div className={styles.fileTreeItem} ref={itemRef}>
        <div 
          className={styles.itemContent} 
          onClick={toggleOpen} 
          onContextMenu={handleContextMenu}>
          <span className={styles.icon}>
            {item.is_folder ? (
              isOpen ? <FaFolderOpen /> : <FaFolder />
            ) : (
              <FaFile />
            )}
          </span>
          <span className={styles.name}>{item.title}</span>
          {item.is_folder && (
            <span className={styles.arrow}>
              {isOpen ? <FaChevronDown /> : <FaChevronRight />}
            </span>
          )}
        </div>
        {item.is_folder && isOpen && (
          <div className={styles.nestedContent}>
            {item.children.map((child, index) => (
              <FileTreeItem 
                key={index} 
                item={child} 
                level={level + 1} 
                onUpdate={onUpdate}
                onContextMenu={onContextMenu}/>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default FileTreeItem;