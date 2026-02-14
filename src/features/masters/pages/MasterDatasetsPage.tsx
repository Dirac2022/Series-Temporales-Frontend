import { MasterUploadCard } from "../components/MasterUploadCard";
import { masterService, type MasterEntityType, type MasterStatusResponse } from "../../../services/api";
import { useEffect, useState } from "react";
import { logger } from "../../../services/logger";

const MASTER_ENTITIES: { type: MasterEntityType; title: string; description: string }[] = [
    {
        type: "products",
        title: "Productos",
        description: "Catálogo maestro de productos (SKUs, Marcas, Categorias)."
    },
    {
        type: "territories",
        title: "Territorios",
        description: "Estructura geográfica de ventas (Regiones, Zonas, Territorios)."
    },
    {
        type: "warehouses",
        title: "Almacenes",
        description: "Centros de distribución y puntos de despacho."
    },
    {
        type: "channels",
        title: "Canales",
        description: "Canales de venta y segmentación de clientes."
    },
    {
        type: "accounts",
        title: "Cuentas",
        description: "Clientes y cuentas clave (Key Accounts)."
    },
    {
        type: "distributors",
        title: "Distribuidores",
        description: "Socios comerciales y red de distribución externa."
    }
];

export default function MasterDatasetsPage() {

    const [statuses, setStatuses] = useState<MasterStatusResponse | null>(null);

    const fetchStatus = async () => {
        try {
            const data = await masterService.getMasterStatus();
            setStatuses(data);
        } catch (error) {
            logger.error("UI", "Error fetching master status", error);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ENCABEZADO */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Datasets Maestro</h1>
                <p className="text-muted-foreground">
                    Gestiona los datos de referencia para el enriquecimiento de reportes y filtros.
                </p>
            </div>

            {/* GRID DE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MASTER_ENTITIES.map((entity) => (
                    <div key={entity.type} className="h-96">
                        <MasterUploadCard
                            entityType={entity.type}
                            title={entity.title}
                            description={entity.description}
                            lastUpdated={statuses?.[entity.type]}
                            onUploadSuccess={fetchStatus}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
