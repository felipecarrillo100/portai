import * as React from 'react';
import DraggableListItem, {DraggableItem} from './DraggableListItem';
import {
    DragDropContext,
    Droppable,
    OnDragEndResponder
} from 'react-beautiful-dnd';

export type DraggableListProps = {
    items: DraggableItem[];
    onDragEnd: OnDragEndResponder;
};

const DraggableList = React.memo(({ items, onDragEnd }: DraggableListProps) => {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable-list">
                {provided => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {items.map((item, index) => (
                            <DraggableListItem item={item} index={index} key={item.id} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
});

export default DraggableList;
