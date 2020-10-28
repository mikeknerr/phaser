import React from 'react';
import styled from 'styled-components';

const Flex = styled.div`
  display: flex;
  flex-direction: ${props => props.flexDirection || 'row'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.alignItems || 'stretch'};
  align-content: ${props => props.alignContent || 'stretch'};
  align-self: ${props => props.alignSelf || 'auto'};
  margin: ${props => props.margin || 0};
  padding: ${props => props.padding || 0};
  flex-basis: ${props => props.flexBasis || 'auto'};
  flex-grow: ${props => props.flexGrow || null};
  flex-shrink: ${props => props.flexShrink || 1};
  max-width: ${props => props.maxWidth || null};
`;

const FlexContainer = React.forwardRef((props, ref) => {
  return (
    <Flex ref={ref} {...props}>
      {props.children}
    </Flex>
  );
});

export default FlexContainer;
