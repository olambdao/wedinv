import styled from "styled-components";

const ModalWrap = styled.div`
  display: flex;
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 20px;
  background: rgba(20, 17, 13, 0.45);
`;

const ModalContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

type Props = {
  children: React.ReactNode;
  handleClose: () => void;
};
const Modal = ({ children, handleClose }: Props) => {
  return (
    <ModalWrap onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContent>
    </ModalWrap>
  );
};

export default Modal;
