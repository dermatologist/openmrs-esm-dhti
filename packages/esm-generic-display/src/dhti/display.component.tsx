import React, { useEffect, useState } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import styles from './display.scss';
import { useDhti } from '@openmrs/esm-dhti-utils';

interface DisplayWidgetProps {
    patientUuid: string;
}

const DisplayWidget: React.FC<DisplayWidgetProps> = ({ patientUuid }) => {
    const config = useConfig();
    const serviceName = config?.dhtiServiceName || 'dhti_elixir_display';
    const { submitMessage, loading: aiLoading, error: aiError } = useDhti();
    const [aiResponse, setAiResponse] = useState<any>(null);


    useEffect(() => {
        if (!aiResponse && !aiLoading && !aiError) {
            submitMessage('Analyze display control', serviceName, patientUuid).then(setAiResponse);
        }
    }, [patientUuid, serviceName, submitMessage, aiResponse, aiLoading, aiError]);



    return (
        <div className={styles.container}>
             <div className={styles.content}>
                <div className={styles.aiInsights}>
                    <h4>{config?.dhtiTitle || 'GenAI Interpretation'}</h4>
                    {aiLoading && <p>Generating insights...</p>}
                    {aiError && <p className={styles.error}>Error: {aiError}</p>}
                    {aiResponse && (
                        <div className={styles.aiContent}>
                            <p>{aiResponse.summary}</p>
                            {aiResponse.detail && <p><small>{aiResponse.detail}</small></p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DisplayWidget;
