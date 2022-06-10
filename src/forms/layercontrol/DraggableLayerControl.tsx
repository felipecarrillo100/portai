import * as React from 'react';
import {
    DragDropContext,
    Droppable,
    OnDragEndResponder
} from 'react-beautiful-dnd';
import {DraggableLayer, DraggableLayerItem} from "./DraggableLayerItem";
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import {Map} from "@luciad/ria/view/Map";

export type DraggableListProps = {
    map: Map | null;
    items: TreeNodeInterface[];
    onDragEnd: OnDragEndResponder;
};

const DraggableLayerControl = React.memo(({ items, onDragEnd, map }: DraggableListProps) => {

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable-list">
                {provided => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {items.map((item, index) => (
                            <DraggableLayerItem item={item} index={index} key={item.id} map={map} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
});

export default DraggableLayerControl;
