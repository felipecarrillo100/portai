import React from 'react';
import {MenuEntry} from "./interfaces";
import Button from "@mui/material/Button";

interface Props {
    item: MenuEntry;
    handleClose: () => void;
}

const AdvancedMenuItem: React.FC<Props> = (props: Props) => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  /*  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };*/

    const onClick = (event: React.MouseEvent<HTMLElement>) => {
        // props.handleClose();
      //  handleOpenUserMenu(event);
    }

    return (
        <Button
            key={props.item.title}
            onClick={onClick}
            sx={{ my: 2, color: 'rgba(0, 0, 0, 0.87)', display: 'block' }}
        >
            {props.item.title}
        </Button>
    );
}

export {
    AdvancedMenuItem
}