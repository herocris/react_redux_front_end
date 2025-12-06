import { MouseEvent, useState } from 'react';
import { AllInbox, HomeRepairServiceOutlined, Vaccines,ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material';
import { CrudDrugConfiscation } from '../../drugConfiscation';
import { CrudAmmunitionConfiscation } from '../../ammunitionConfiscation';
import { CrudWeaponConfiscation } from '../../weaponConfiscation';


export const SubConfiscations = () => {
    const [selectedCard, setSelectedCard] = useState('panel1-header');
    const setCardId = (e: React.MouseEvent<HTMLDivElement>) => {
        // if (e.currentTarget.ariaExpanded && e.currentTarget.id == selectedCard) {
        //     setSelectedCard('');
        // } else {
        //     setSelectedCard(e.currentTarget.id);
        // }
        setSelectedCard(e.currentTarget.id);
    }


    console.log('carga acordion');


    return (
        <div>
            <div>
                <Accordion expanded={selectedCard === "panel1-header"}>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        onClick={(e: MouseEvent<HTMLDivElement>) => setCardId(e)}
                    >
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'start',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <Vaccines color="action" fontSize="large" />
                            <Typography variant="h6" component="div">
                                Drugs
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>

                        <CrudDrugConfiscation />

                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={selectedCard === "panel2-header"}>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel2-content"
                        id="panel2-header"
                        onClick={(e: MouseEvent<HTMLDivElement>) => setCardId(e)}
                    >
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'start',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <HomeRepairServiceOutlined color="action" fontSize="large" />
                            <Typography variant="h6" component="div">
                                Weapons
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>

                        <CrudWeaponConfiscation />

                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={selectedCard === "panel3-header"}>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="panel3-content"
                        id="panel3-header"
                        onClick={(e: MouseEvent<HTMLDivElement>) => setCardId(e)}
                    >
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'start',
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <AllInbox color="action" fontSize="large" />
                            <Typography variant="h6" component="div">
                                Ammunitions
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>

                        <CrudAmmunitionConfiscation />

                    </AccordionDetails>
                </Accordion>
            </div>

        </div>
    )
}
