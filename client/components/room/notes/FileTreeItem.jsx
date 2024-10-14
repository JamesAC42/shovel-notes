import React, { useState, useRef, useEffect, useContext } from 'react';
import styles from '../../../styles/room/notes/notesnavigation.module.scss';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { LuLoader2 } from "react-icons/lu";
import RoomContext from '../../../contexts/RoomContext';
import getFolderContent from '../../../utilities/getFolderContent';
import getPageContent from '../../../utilities/getPageContent';

const FileTreeItem = ({ item, level, onUpdate, onContextMenu, onClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const itemRef = useRef(null);
    const { setRoom } = useContext(RoomContext);


    const [isLoading, setIsLoading] = useState(false);
    const retrieveFolderContent = async (folderId) => {
        setIsLoading(true);
        const content = await getFolderContent(folderId);
        if (content) {
            setRoom(prevRoom => {
                const updateFolder = (notebook) => {
                    return notebook.map(page => {
                        if (page.id === folderId) {
                            return { ...page, children: content };
                        } else if (page.children) {
                            return { ...page, children: updateFolder(page.children) };
                        }
                        return page;
                    });
                };
                return { ...prevRoom, notebook: updateFolder(prevRoom.notebook) };
            });
        }
        setIsLoading(false);
    }

    const retrievePageContent = async (pageId) => {
        setIsLoading(true);
        const content = await getPageContent(pageId);
        if (content) {
            setRoom(prevRoom => {
                const updatePage = (notebook) => {
                    return notebook.map(page => {
                        if (page.id === pageId) {
                            return { ...page, content };
                        } else if (page.children) {
                            return { ...page, children: updatePage(page.children) };
                        }
                        return page;
                    });
                };
                return { ...prevRoom, notebook: updatePage(prevRoom.notebook) };
            });
        }
        setIsLoading(false);
    }
  
    const handleClick = (e) => {
        if(item.is_folder) {
            if(item.children.length === 0) {
                retrieveFolderContent(item.id);
            }
            setIsOpen(!isOpen);
        } else {
            if(item.content === "") {
                retrievePageContent(item.id);
            }
            onClick(e, item);
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
          onClick={handleClick} 
          onContextMenu={handleContextMenu}>
          <span className={styles.icon}>
            {item.is_folder ? (
              isOpen ? <FaFolderOpen /> : <FaFolder />
            ) : (
              <FaFile />
            )}
          </span>
          <span className={styles.name}>{item.title}</span>
          {(item.is_folder || isLoading) && (
            <span className={styles.arrow}>
                {
                    isLoading ? <LuLoader2 /> : (
                        isOpen ? <FaChevronDown /> : <FaChevronRight />
                    )
                }
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
                onContextMenu={onContextMenu}
                onClick={onClick}/>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default FileTreeItem;
