import React, {useEffect, useRef, useState} from 'react';
import "./FormHolder.scss";
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';

interface Props{
    id: FormHolders;
}

interface FormHolderState {
    props: Props;
    formState: {form: JSX.Element | null, setForm: (f:JSX.Element | null)=>void};
    openState: {open:boolean, setOpen:(v:boolean)=>void};
    onClose: () => void;
}

interface FormHolderObjectType  {
    [key:string]: FormHolderState
}

export enum FormHolders {
    LEFT= "LEFT",
    RIGHT= "RIGHT",
    BOTTOM = "BOTTOM",
}

const FormHolder: React.FC<Props> = ( props: Props ) => {
    const formRef = useRef(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [content, setContent] = useState([] as JSX.Element[]);
    const [form, setForm] = useState(null as JSX.Element | null);
    const [open, setOpen] = useState(false);

    const setContentExtra = (c: JSX.Element[]) => {
        setContent(c);
        setTimeout(()=>{
            if (contentRef.current) {
                const focusable =  contentRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable && focusable.length>0) {
                    const firstElement = focusable[0];
                    (firstElement as any).focus();
                }
            }
        }, 150);
    }

    const canClose = () => {
        if (formRef.current && (formRef.current as any).canClose) {
            return (formRef.current as any).canClose();
        }
        return true;
    }

    const onClose = () =>{
        if (canClose()) {
            setTimeout(()=>{
                setForm( null);
            }, 1);
            setOpen(false);
        }
    }

    useEffect(() => {
        const handleEsc = (event: any) => {
            if (event.keyCode === 27) {
                event.stopPropagation();
                event.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const hasContent = () => {
      return content.length > 0;
    }

    useEffect(()=>{
        if (props.id) {
            FormManager.register(props.id, {
                props,
                formState: {form, setForm},
                openState: {open, setOpen},
                onClose,
            })
        }
    }, [props.id]);

    useEffect(()=>{
        const OpenNewForm = () => {
            if (form){
                // @ts-ignore
                const signature = form.type.render ? form.type.render.length : 0;
                if (signature===2) {
                    const ClonedElementWithMoreProps = React.cloneElement(
                        form,
                        { ref: formRef, closeForm: onClose}
                    );
                    setContentExtra([ClonedElementWithMoreProps]);
                } else {
                    formRef.current = null;
                    const ClonedElementWithMoreProps = React.cloneElement(
                        form,
                        { closeForm: onClose}
                    );
                    setContentExtra([ClonedElementWithMoreProps]);
                }
            }
            setOpen(true);
        }
        if (form === null) {
            setContent([]);
        } else {
            if (hasContent()) {
                if (canClose()) {
                    onClose();
                }
                setTimeout(()=>{
                    OpenNewForm();
                }, 100);
            } else {
                OpenNewForm();
            }
        }
    }, [form]);


    const className = open ? "FormHolder visible" : "FormHolder"
    return (<div className={className} id={props.id}>
        <div className="header">
            <div className="title"></div>
            <div className="closeButton">
                <IconButton onClick={onClose}>
                    <CloseIcon style={{ color: 'white' }}/>
                </IconButton>
            </div>
        </div>
        <div className="body">
            <div className="content" ref={contentRef}>
                {content.length>0 && content[0]}
            </div>
        </div>
    </div>)
}

class FormManager {
    static FormHolderObject: FormHolderObjectType = {};
    static register(id: FormHolders, o:FormHolderState) {
        FormManager.FormHolderObject[id] = o;
    }
    static unregister(id: FormHolders) {
        delete FormManager.FormHolderObject[id];
    }
    static getByID(id: FormHolders) {
        return FormManager.FormHolderObject[id];
    }

    static openForm(id: FormHolders, aForm: JSX.Element) {
        const target = FormManager.getByID(id);

        if (target) {
            const {setForm} = target.formState;
            setForm(aForm);
        }
    }

    static dismiss(id: FormHolders) {
        const target = FormManager.getByID(id);
        if (target) {
            target.onClose();
        }
    }
}


export {
    FormHolder,
    FormManager
}