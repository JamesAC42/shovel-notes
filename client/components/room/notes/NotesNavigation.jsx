import React, { useState, useContext} from "react";
import styles from "../../../styles/room/notes/notesnavigation.module.scss";
import FileTreeItem from "./FileTreeItem";
import ContextMenu from "./ContextMenu";
import RoomContext from "../../../contexts/RoomContext";

/*----------------------------------------------------------------
    {
      type: "folder",
      name: "Documents",
      contents: [
        { type: "file", name: "resume.pdf" },
        {
          type: "folder",
          name: "Projects",
          contents: [
            { type: "file", name: "project1.txt" },
            { type: "file", name: "project2.txt" },
          ],
        },
      ],
    },
    {
      type: "folder",
      name: "Images",
      contents: [
        { type: "file", name: "photo1.jpg" },
        { type: "file", name: "photo2.jpg" },
      ],
    },
    { type: "file", name: "notes.txt" },
----------------------------------------------------------------*/

export const ContextMenuMode = {
  FOLDER: "folder",
  NOTE: "note",
  ROOT: "root",
}

const NotesNavigation = () => {

  const { room } = useContext(RoomContext);

  const [showContext, setShowContext] = useState(false);
  const [contextMenuMode, setContextMenuMode] = useState(ContextMenuMode.ROOT);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuParent, setContextMenuParent] = useState(null);

  const handleContextMenuFromTree = (e, item, position) => {
    e.preventDefault();
    setShowContext(true);
    setContextMenuPosition(position);
    setContextMenuMode(item.is_folder ? ContextMenuMode.FOLDER : ContextMenuMode.NOTE);
    setContextMenuParent(item);
    e.stopPropagation();
  }

  const handleContextMenu = (e) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    setShowContext(true);
    setContextMenuMode(ContextMenuMode.ROOT);
    setContextMenuPosition({x: clientX, y: clientY});
    setContextMenuParent(null);
    e.stopPropagation();
  }

  const renderFileTree = () => {
    if(!room) return null;
    if(!room.notebook) return null;
    if(room.notebook.length === 0) {
        return <div className={styles.noNotes}>No notes yet</div>;
    }
    return (
        room.notebook.map((item, index) => (
            <FileTreeItem
              key={index}
              item={item}
              level={0}
              onContextMenu={handleContextMenuFromTree}
            />
          ))
    )
  }

  return (
    <div
      onClick={() => setShowContext(false)}
      className={styles.navigationSectionContent}>
      {
        showContext && 
        <ContextMenu 
            position={contextMenuPosition} 
            mode={contextMenuMode} 
            parent={contextMenuParent}
            onClose={() => setShowContext(false)}
            />
      }
      <div
        onContextMenu={handleContextMenu}
        className={styles.fileTree}>
        {renderFileTree()}
      </div>
    </div>
  );
};

export default NotesNavigation;
