package models

import (
	"fmt"
	"log"
	"strconv"

	"github.com/jinzhu/gorm"
)

/*	=========================
	STRUCT ITENS FATURA
=========================	*/

type ItensFatura struct {
	NumNF                uint32  `gorm:"primary_key;foreign_key:NumNF;not null" json:"num_nf"`
	CodIbge              uint32  `gorm:"primary_key;foreign_key:CodIbge;not null" json:"cod_ibge"`
	IDEmpenho            uint32  `gorm:"primary_key;foreign_key:IDEmpenho;not null" json:"id_empenho"`
	CodItem              uint32  `gorm:"primary_key;foreign_key:CodItem;not null" json:"cod_item"`
	CodTipoItem          uint32  `gorm:"primary_key;foreign_key:CodTipoItem;not null" json:"cod_tipo_item"`
	CodEmpenho           string  `gorm:"default:null" json:"cod_empenho"`
	Tipo                 string  `gorm:"default:null" json:"tipo"`
	Valor                float32 `gorm:"default:null" json:"valor"`
	Quantidade           float32 `gorm:"default:null" json:"quantidade"`
	Descricao            string  `gorm:"default:null" json:"descricao"`
	QuantidadeDisponivel float32 `gorm:"default:null" json:"quantidade_disponivel"`
}

/*  =========================
	FUNCAO SALVAR ITENS FATURA
=========================  */

func (itensFatura *ItensFatura) SaveItensFatura(db *gorm.DB) (*ItensFatura, error) {

	//	Adiciona um novo elemento ao banco de dados
	err := db.Debug().Create(&itensFatura).Error
	if err != nil {
		return &ItensFatura{}, err
	}

	return itensFatura, err
}

/*  =========================
	FUNCAO LISTAR ITENS FATURA POR ID
=========================  */

func (itensFatura *ItensFatura) FindItensFaturaByID(db *gorm.DB, numNF, codIbge, idEmpenho, codItem, codTipoItem uint32) (*ItensFatura, error) {

	//	Busca um elemento no banco de dados de acordo com suas chaves primarias
	err := db.Debug().Model(&ItensFatura{}).Where("num_nf = ? AND cod_ibge = ? AND id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?", numNF, codIbge, idEmpenho, codItem, codTipoItem).Take(&itensFatura).Error
	if err != nil {
		return &ItensFatura{}, err
	}

	return itensFatura, err
}

/*  =========================
	FUNCAO LISTAR TODAS ITENS FATURA
=========================  */

func (itensFatura *ItensFatura) FindAllItensFatura(db *gorm.DB, numNF, codIbge uint32) (*[]ItensFatura, error) {

	allItensFatura := []ItensFatura{}
	itensFaturaAux := []ItensFatura{}
	allItensEmpenho := []ItensEmpenho{}
	var quantidadeDisponivel float32 = 0.00

	//	Busca todos os itens_fatura de uma determinada fatura, a partir do num_nf e do cod_ibge
	/*	Comando SQL usado para fazer a busca. Ex.: num_nf = 38 e cod_ibge = 2804904

		SELECT itens_fatura.*, empenho.cod_empenho, previsao_empenho.tipo, itens.descricao
		FROM itens_fatura
		INNER JOIN empenho ON itens_fatura.id_empenho = empenho.id_empenho
		INNER JOIN previsao_empenho ON empenho.cod_previsao_empenho = previsao_empenho.cod_previsao_empenho
		INNER JOIN itens ON itens_fatura.cod_item = itens.cod_item AND itens_fatura.cod_tipo_item = itens.cod_tipo_item
		WHERE itens_fatura.num_nf = 38 AND itens_fatura.cod_ibge = 2804904
		ORDER BY itens_fatura.cod_tipo_item, itens_fatura.cod_item, itens_fatura.id_empenho;
	*/
	err := db.Debug().Table("itens_fatura").
		Select("itens_fatura.*, empenho.cod_empenho, previsao_empenho.tipo, itens.descricao").
		Joins("JOIN empenho ON itens_fatura.id_empenho = empenho.id_empenho").
		Joins("JOIN previsao_empenho ON empenho.cod_previsao_empenho = previsao_empenho.cod_previsao_empenho").
		Joins("JOIN itens ON itens_fatura.cod_item = itens.cod_item AND itens_fatura.cod_tipo_item = itens.cod_tipo_item").
		Where("itens_fatura.num_nf = ? AND itens_fatura.cod_ibge = ?", numNF, codIbge).
		Order("itens_fatura.cod_tipo_item, itens_fatura.cod_item, itens_fatura.id_empenho").
		Scan(&allItensFatura).Error

	if err != nil {
		return &[]ItensFatura{}, err
	}

	//	Busca todos os itens_empenho relacionado aos itens_fatura de uma fatura especifica
	//	Os dados estao ordenados da msm forma que a busca dos itens da fatura
	//	Primeira parte da busca para o calculo de quantidade_disponivel
	/*	Comando SQL utilizado para a busca. Ex.: num_nf = 38 e cod_ibge = 2804904

			SELECT itens_empenho.id_empenho, itens_empenho.cod_item, itens_empenho.cod_tipo_item, itens_empenho.quantidade
			FROM itens_empenho
			WHERE EXISTS (
				SELECT * FROM itens_fatura
		        WHERE itens_fatura.num_nf = 38 AND itens_fatura.cod_ibge = 2804904
		        AND itens_fatura.id_empenho = itens_empenho.id_empenho
		        AND itens_fatura.cod_item = itens_empenho.cod_item
		        AND itens_fatura.cod_tipo_item = itens_empenho.cod_tipo_item
				)
			ORDER BY itens_empenho.cod_tipo_item, itens_empenho.cod_item, itens_empenho.id_empenho
	*/

	err = db.Debug().Table("itens_empenho").
		Select("itens_empenho.quantidade, itens_empenho.id_empenho, itens_empenho.cod_item, itens_empenho.cod_tipo_item").
		Where("EXISTS (SELECT * FROM itens_fatura WHERE itens_fatura.num_nf = ? AND itens_fatura.cod_ibge = ? AND itens_fatura.id_empenho = itens_empenho.id_empenho AND itens_fatura.cod_item = itens_empenho.cod_item AND itens_fatura.cod_tipo_item = itens_empenho.cod_tipo_item)", numNF, codIbge).
		Order("itens_empenho.cod_tipo_item, itens_empenho.cod_item, itens_empenho.id_empenho").
		Scan(&allItensEmpenho).Error

	if err != nil {
		return &[]ItensFatura{}, err
	}

	/*	Comando SQL usado para a busca da segunda parte do calculo de quantidade_disponivel
		-- Esse comando nao contempla o calculo de quantidade_disponivel para os itens especiais
		-- itens_fatura com cod_tipo_item 8, 9 e 10 (casos especiais)

		SELECT SUM(itens_fatura.quantidade) AS quantidade_disponivel, itens_fatura.cod_item, itens_fatura.cod_tipo_item, itens_fatura.id_empenho
		FROM fatura
		INNER JOIN itens_fatura
		ON fatura.num_nf = itens_fatura.num_nf
		AND fatura.cod_ibge = itens_fatura.cod_ibge
		WHERE fatura.cod_ibge IN (
			SELECT cd.cod_ibge
		    FROM cd
		    WHERE cd.cod_lote = (SELECT cd.cod_lote FROM cd WHERE cd.cod_ibge = 2804904)
			) AND (itens_fatura.id_empenho
		    		,itens_fatura.cod_item
		    		,itens_fatura.cod_tipo_item) IN
				(SELECT itens_fatura.id_empenho, itens_fatura.cod_item, itens_fatura.cod_tipo_item FROM itens_fatura
				WHERE itens_fatura.num_nf = 38 AND itens_fatura.cod_ibge = 2804904
		        )
		GROUP BY itens_fatura.id_empenho, itens_fatura.cod_item, itens_fatura.cod_tipo_item
		ORDER BY itens_fatura.cod_tipo_item, itens_fatura.cod_item, itens_fatura.id_empenho
	*/

	err = db.Debug().Table("fatura").
		Select("SUM(itens_fatura.quantidade) AS quantidade_disponivel, itens_fatura.cod_item, itens_fatura.cod_tipo_item, itens_fatura.id_empenho").
		Joins("JOIN itens_fatura ON fatura.num_nf = itens_fatura.num_nf AND fatura.cod_ibge = itens_fatura.cod_ibge").
		Where("fatura.cod_ibge IN (SELECT cd.cod_ibge FROM cd WHERE cd.cod_lote = (SELECT cd.cod_lote FROM cd WHERE cd.cod_ibge = ?)) AND (itens_fatura.id_empenho,itens_fatura.cod_item,itens_fatura.cod_tipo_item) IN (SELECT itens_fatura.id_empenho, itens_fatura.cod_item, itens_fatura.cod_tipo_item FROM itens_fatura WHERE itens_fatura.num_nf = ? AND itens_fatura.cod_ibge = ?)", codIbge, numNF, codIbge).
		Group("itens_fatura.id_empenho, itens_fatura.cod_item, itens_fatura.cod_tipo_item").
		Order("itens_fatura.cod_tipo_item, itens_fatura.cod_item, itens_fatura.id_empenho").
		Scan(&itensFaturaAux).Error

	if err != nil {
		return &[]ItensFatura{}, err
	}

	/* Antigo metodo de calculo de quantidade disponivel para itensfatura
	for i, data := range allItensFatura {
		//	Busca um elemento no banco de dados a partir de sua chave primaria
			err := db.Debug().
				Raw("SELECT ROUND((SELECT itens_empenho.quantidade FROM itens_empenho WHERE id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?) - (SELECT SUM(itens_fatura.quantidade) AS quantidade_fatura FROM fatura INNER JOIN itens_fatura ON fatura.num_nf = itens_fatura.num_nf AND fatura.cod_ibge = itens_fatura.cod_ibge WHERE fatura.cod_ibge IN (SELECT cd.cod_ibge FROM cd where cd.cod_lote = (SELECT cd.cod_lote FROM cd WHERE cd.cod_ibge = ?)) AND id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?), 2) AS quantidade_disponivel, itens.descricao AS descricao, empenho.cod_empenho FROM itens_empenho INNER JOIN itens ON itens_empenho.cod_item = itens.cod_item AND itens_empenho.cod_tipo_item = itens.cod_tipo_item INNER JOIN empenho ON itens_empenho.id_empenho = empenho.id_empenho WHERE itens_empenho.id_empenho = ? AND itens_empenho.cod_item = ? AND itens_empenho.cod_tipo_item = ?", data.IDEmpenho, data.CodItem, data.CodTipoItem, data.CodIbge, data.IDEmpenho, data.CodItem, data.CodTipoItem, data.IDEmpenho, data.CodItem, data.CodTipoItem).
				Scan(&allItensFatura[i]).Error
			if err != nil {
				return &[]ItensFatura{}, err
			}
		} else {
			err := db.Debug().
				Raw("SELECT ROUND((SELECT itens_empenho.quantidade FROM itens_empenho WHERE id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?) - (SELECT SUM(itens_fatura.quantidade) AS quantidade_fatura FROM fatura INNER JOIN itens_fatura ON fatura.num_nf = itens_fatura.num_nf AND fatura.cod_ibge = itens_fatura.cod_ibge WHERE id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?), 2) AS quantidade_disponivel, itens.descricao AS descricao FROM itens_empenho INNER JOIN itens ON itens_empenho.cod_item = itens.cod_item AND itens_empenho.cod_tipo_item = itens.cod_tipo_item WHERE itens_empenho.id_empenho = ? AND itens_empenho.cod_item = ? AND itens_empenho.cod_tipo_item = ?", data.IDEmpenho, data.CodItem, data.CodTipoItem, data.IDEmpenho, data.CodItem, data.CodTipoItem, data.IDEmpenho, data.CodItem, data.CodTipoItem).
				Scan(&allItensFatura[i]).Error
			if err != nil {
				return &[]ItensFatura{}, err
			}
		}
	}
	*/

	for i, data := range allItensFatura {
		//	Busca um elemento no banco de dados a partir de sua chave primaria

		if allItensFatura[i].CodTipoItem == 8 || allItensFatura[i].CodTipoItem == 9 || allItensFatura[i].CodTipoItem == 10 {
			/* ---------------	Quantidade Total Disponivel em ItensPrevisaoEmpenho -----------------*/

			quantidadeDisponivel = 0
			fmt.Println(quantidadeDisponivel)

			/* ITEM 8.x */
			//	 itens_empenho.quantidade * itens_fatura.valor - itens_fatura.quantidade * itens_fatura.valor 8.x
			db.Debug().
				Raw("SELECT ROUND((SELECT SUM(itens_empenho.quantidade * itens_fatura.valor) AS quant_valor FROM itens_empenho INNER JOIN itens_fatura ON itens_empenho.id_empenho = itens_fatura.id_empenho AND itens_empenho.cod_item = itens_fatura.cod_item AND itens_empenho.cod_tipo_item = itens_fatura.cod_tipo_item WHERE itens_fatura.id_empenho = ? AND itens_fatura.cod_item = ? AND itens_fatura.cod_tipo_item = 8) - (SELECT SUM(itens_fatura.quantidade * itens_fatura.valor) AS quantidade_fatura FROM fatura INNER JOIN itens_fatura ON fatura.num_nf = itens_fatura.num_nf AND fatura.cod_ibge = itens_fatura.cod_ibge WHERE fatura.cod_ibge IN (SELECT cd.cod_ibge FROM cd WHERE cd.cod_lote = (SELECT cd.cod_lote FROM cd WHERE cd.cod_ibge = ?)) AND itens_fatura.id_empenho = ? AND itens_fatura.cod_item = ? AND itens_fatura.cod_tipo_item = 8), 2) AS quantidade_disponivel, itens.descricao AS descricao, empenho.cod_empenho FROM itens_empenho INNER JOIN itens ON itens_empenho.cod_item = itens.cod_item AND itens_empenho.cod_tipo_item = itens.cod_tipo_item INNER JOIN empenho ON itens_empenho.id_empenho = empenho.id_empenho WHERE itens_empenho.id_empenho = ? AND itens_empenho.cod_item = ? AND itens_empenho.cod_tipo_item = 8", data.IDEmpenho, data.CodItem, data.CodIbge, data.IDEmpenho, data.CodItem, data.IDEmpenho, data.CodItem).
				Scan(&itensFatura)

			//	QuantidadeDisponivel recebe item 8.x
			quantidadeDisponivel = itensFatura.QuantidadeDisponivel

			/* ITEM 9.x */
			//	 itens_empenho.quantidade * itens_fatura.valor - itens_fatura.quantidade * itens_fatura.valor 9.x
			db.Debug().
				Raw("SELECT ROUND((SELECT SUM(itens_empenho.quantidade * itens_fatura.valor) AS quant_valor FROM itens_empenho INNER JOIN itens_fatura ON itens_empenho.id_empenho = itens_fatura.id_empenho AND itens_empenho.cod_item = itens_fatura.cod_item AND itens_empenho.cod_tipo_item = itens_fatura.cod_tipo_item WHERE itens_fatura.id_empenho = ? AND itens_fatura.cod_item = ? AND itens_fatura.cod_tipo_item = 9) - (SELECT SUM(itens_fatura.quantidade * itens_fatura.valor) AS quantidade_fatura FROM fatura INNER JOIN itens_fatura ON fatura.num_nf = itens_fatura.num_nf AND fatura.cod_ibge = itens_fatura.cod_ibge WHERE fatura.cod_ibge IN (SELECT cd.cod_ibge FROM cd WHERE cd.cod_lote = (SELECT cd.cod_lote FROM cd WHERE cd.cod_ibge = ?)) AND itens_fatura.id_empenho = ? AND itens_fatura.cod_item = ? AND itens_fatura.cod_tipo_item = 9), 2) AS quantidade_disponivel, itens.descricao AS descricao, empenho.cod_empenho FROM itens_empenho INNER JOIN itens ON itens_empenho.cod_item = itens.cod_item AND itens_empenho.cod_tipo_item = itens.cod_tipo_item INNER JOIN empenho ON itens_empenho.id_empenho = empenho.id_empenho WHERE itens_empenho.id_empenho = ? AND itens_empenho.cod_item = ? AND itens_empenho.cod_tipo_item = 9", data.IDEmpenho, data.CodItem, data.CodIbge, data.IDEmpenho, data.CodItem, data.IDEmpenho, data.CodItem).
				Scan(&itensFatura)

			//	QuantidadeDisponivel recebe quantidade*preco do item 9.x
			quantidadeDisponivel += itensFatura.QuantidadeDisponivel

			/* ITEM 10.x */
			//	 itens_empenho.quantidade * itens_fatura.valor - itens_fatura.quantidade * itens_fatura.valor 10.x
			db.Debug().
				Raw("SELECT ROUND((SELECT SUM(itens_empenho.quantidade * itens_fatura.valor) AS quant_valor FROM itens_empenho INNER JOIN itens_fatura ON itens_empenho.id_empenho = itens_fatura.id_empenho AND itens_empenho.cod_item = itens_fatura.cod_item AND itens_empenho.cod_tipo_item = itens_fatura.cod_tipo_item WHERE itens_fatura.id_empenho = ? AND itens_fatura.cod_item = ? AND itens_fatura.cod_tipo_item = 10) - (SELECT SUM(itens_fatura.quantidade * itens_fatura.valor) AS quantidade_fatura FROM fatura INNER JOIN itens_fatura ON fatura.num_nf = itens_fatura.num_nf AND fatura.cod_ibge = itens_fatura.cod_ibge WHERE fatura.cod_ibge IN (SELECT cd.cod_ibge FROM cd WHERE cd.cod_lote = (SELECT cd.cod_lote FROM cd WHERE cd.cod_ibge = ?)) AND itens_fatura.id_empenho = ? AND itens_fatura.cod_item = ? AND itens_fatura.cod_tipo_item = 10), 2) AS quantidade_disponivel, itens.descricao AS descricao, empenho.cod_empenho FROM itens_empenho INNER JOIN itens ON itens_empenho.cod_item = itens.cod_item AND itens_empenho.cod_tipo_item = itens.cod_tipo_item INNER JOIN empenho ON itens_empenho.id_empenho = empenho.id_empenho WHERE itens_empenho.id_empenho = ? AND itens_empenho.cod_item = ? AND itens_empenho.cod_tipo_item = 10", data.IDEmpenho, data.CodItem, data.CodIbge, data.IDEmpenho, data.CodItem, data.IDEmpenho, data.CodItem).
				Scan(&itensFatura)

			//	QuantidadeDisponivel recebe quantidade*preco do item 10.x
			quantidadeDisponivel += itensFatura.QuantidadeDisponivel

			/* --------- Quantidade Disponivel para Reajuste ----------------*/
			//	Busca o itens_fatura.valor do item em questao e retorna a quantidade disponivel que sera consumida
			db.Debug().
				Raw("SELECT ROUND((? / itens_fatura.valor), 2) AS quantidade_disponivel FROM itens_fatura WHERE itens_fatura.num_nf = ? AND itens_fatura.cod_ibge = ? AND itens_fatura.id_empenho = ? AND itens_fatura.cod_tipo_item = ? AND itens_fatura.cod_item = ?", quantidadeDisponivel, data.NumNF, data.CodIbge, data.IDEmpenho, data.CodTipoItem, data.CodItem).
				Scan(&itensFatura)

			log.Print(itensFatura)

			//	Quantidade Disponivel apos os calculos eh retonada ao campo
			allItensFatura[i].QuantidadeDisponivel = itensFatura.QuantidadeDisponivel

		} else {

			// err := db.Debug().
			// 	Raw("SELECT ROUND((?) - (SELECT SUM(itens_fatura.quantidade) AS quantidade_fatura FROM fatura INNER JOIN itens_fatura ON fatura.num_nf = itens_fatura.num_nf AND fatura.cod_ibge = itens_fatura.cod_ibge WHERE fatura.cod_ibge IN (SELECT cd.cod_ibge FROM cd where cd.cod_lote = (SELECT cd.cod_lote FROM cd WHERE cd.cod_ibge = ?)) AND id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?), 2) AS quantidade_disponivel", allItensEmpenho[i].Quantidade, data.CodIbge, data.IDEmpenho, data.CodItem, data.CodTipoItem).
			// 	Scan(&allItensFatura[i]).Error
			// if err != nil {
			// 	return &[]ItensFatura{}, err
			// }

			quantidadeDisponivel = 0

			s := fmt.Sprintf("%.2f", allItensEmpenho[i].Quantidade-itensFaturaAux[i].QuantidadeDisponivel)

			quantidadeDisponivel, _ := strconv.ParseFloat(s, 32)

			allItensFatura[i].QuantidadeDisponivel = float32(quantidadeDisponivel)
		}
	}

	return &allItensFatura, err
}

/*  =========================
	FUNCAO EDITAR ITENS FATURA
=========================  */

func (itensFatura *ItensFatura) UpdateItensFatura(db *gorm.DB, numNF, codIbge, idEmpenho, codItem, codTipoItem uint32) (*ItensFatura, error) {

	//	Permite a atualizacao dos campos indicados
	db = db.Debug().Exec("UPDATE itens_fatura SET valor = ?, quantidade = ? WHERE num_nf = ? AND cod_ibge = ? AND id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?", itensFatura.Valor, itensFatura.Quantidade, numNF, codIbge, idEmpenho, codItem, codTipoItem)
	if db.Error != nil {
		return &ItensFatura{}, db.Error
	}

	//	Busca um elemento no banco de dados a partir de sua chave primaria
	err := db.Debug().Model(&ItensFatura{}).Take(&itensFatura).Error
	if err != nil {
		return &ItensFatura{}, err
	}

	return itensFatura, err
}

/*  =========================
	FUNCAO DELETAR ITENS OTB POR ID
=========================  */

func (itensFatura *ItensFatura) DeleteItensFatura(db *gorm.DB, numNF, cod_ibge, idEmpenho, codItem, codTipoItem uint32) error {

	//	Deleta um elemento contido no banco de dados a partir de sua chave primaria
	db = db.Debug().Model(&ItensFatura{}).Where("num_nf = ? AND cod_ibge = ? AND id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?", numNF, cod_ibge, idEmpenho, codItem, codTipoItem).Take(&ItensFatura{}).Delete(&ItensFatura{})

	return db.Error
}

/*  =========================
	FUNCAO LISTAR TODAS ITENS FATURA DISPONIVEIS DO TIPO ORIGINAL
=========================  */

func (itensEmpenho *ItensEmpenho) FindItensFaturaDisponiveisOriginal(db *gorm.DB, codIbge uint32) (*[]ItensEmpenho, error) {

	allItensEmpenho := []ItensEmpenho{}

	err := db.Debug().Table("previsao_empenho").
		Select("previsao_empenho.tipo, itens_empenho.*").
		Joins("JOIN itens_empenho ON previsao_empenho.cod_previsao_empenho = itens_empenho.cod_previsao_empenho WHERE previsao_empenho.tipo = 'o' AND previsao_empenho.cod_lote = (SELECT cd.cod_lote FROM cd WHERE cd.cod_ibge = ?) ORDER BY id_empenho, cod_tipo_item, cod_item", codIbge).
		Scan(&allItensEmpenho).Error
	if err != nil {
		return &[]ItensEmpenho{}, err
	}

	for i, data := range allItensEmpenho {
		//	Busca um elemento no banco de dados a partir de sua chave primaria
		err := db.Debug().
			Raw("SELECT ROUND((SELECT itens_empenho.quantidade FROM itens_empenho WHERE id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?) - (SELECT SUM(itens_fatura.quantidade) AS quantidade_fatura FROM fatura INNER JOIN itens_fatura ON fatura.num_nf = itens_fatura.num_nf AND fatura.cod_ibge = itens_fatura.cod_ibge WHERE fatura.cod_ibge IN (SELECT cd.cod_ibge FROM cd where cd.cod_lote = (SELECT cd.cod_lote FROM cd WHERE cd.cod_ibge = ?)) AND id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?), 2) AS quantidade_disponivel, itens.descricao AS descricao, empenho.cod_empenho FROM itens_empenho INNER JOIN itens ON itens_empenho.cod_item = itens.cod_item AND itens_empenho.cod_tipo_item = itens.cod_tipo_item INNER JOIN empenho ON itens_empenho.id_empenho = empenho.id_empenho WHERE itens_empenho.id_empenho = ? AND itens_empenho.cod_item = ? AND itens_empenho.cod_tipo_item = ?", data.IDEmpenho, data.CodItem, data.CodTipoItem, codIbge, data.IDEmpenho, data.CodItem, data.CodTipoItem, data.IDEmpenho, data.CodItem, data.CodTipoItem).
			Scan(&allItensEmpenho[i]).Error
		if err != nil {
			return &[]ItensEmpenho{}, err
		}
	}

	return &allItensEmpenho, err
}

/*  =========================
	FUNCAO LISTAR TODAS ID EMPENHO DO TIPO REAJUSTE
=========================  */

func (itensEmpenho *ItensEmpenho) FindIDEmpenhoReajuste(db *gorm.DB) (*[]ItensEmpenho, error) {

	allItensEmpenho := []ItensEmpenho{}

	err := db.Debug().Table("itens_empenho").
		Select("itens_empenho.id_empenho, empenho.cod_empenho").
		Joins("JOIN empenho ON itens_empenho.id_empenho = empenho.id_empenho").
		Joins("JOIN previsao_empenho ON empenho.cod_previsao_empenho = previsao_empenho.cod_previsao_empenho AND previsao_empenho.tipo = 'r'").
		Group("id_empenho").
		Order("id_empenho").
		Scan(&allItensEmpenho).Error
	if err != nil {
		return &[]ItensEmpenho{}, err
	}

	return &allItensEmpenho, err
}

/*  =========================
	FUNCAO LISTAR TODAS ITENS FATURA DISPONIVEIS DO TIPO REAJUSTE
=========================  */

func (itensEmpenho *ItensEmpenho) FindItensFaturaDisponiveisReajuste(db *gorm.DB, idEmpenho uint32) (*[]ItensEmpenho, error) {

	allItensEmpenho := []ItensEmpenho{}

	err := db.Debug().Table("itens_empenho").
		Select("itens_empenho.*").
		Where("itens_empenho.id_empenho = ?", idEmpenho).
		Order("cod_tipo_item, cod_item").
		Scan(&allItensEmpenho).Error
	if err != nil {
		return &[]ItensEmpenho{}, err
	}

	for i, data := range allItensEmpenho {
		//	Busca um elemento no banco de dados a partir de sua chave primaria
		err := db.Debug().
			Raw("SELECT ROUND((SELECT itens_empenho.quantidade FROM itens_empenho WHERE id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?) - (SELECT SUM(itens_fatura.quantidade) AS quantidade_fatura FROM fatura INNER JOIN itens_fatura ON fatura.num_nf = itens_fatura.num_nf AND fatura.cod_ibge = itens_fatura.cod_ibge WHERE id_empenho = ? AND cod_item = ? AND cod_tipo_item = ?), 2) AS quantidade_disponivel, itens.descricao AS descricao FROM itens_empenho INNER JOIN itens ON itens_empenho.cod_item = itens.cod_item AND itens_empenho.cod_tipo_item = itens.cod_tipo_item WHERE itens_empenho.id_empenho = ? AND itens_empenho.cod_item = ? AND itens_empenho.cod_tipo_item = ?", data.IDEmpenho, data.CodItem, data.CodTipoItem, data.IDEmpenho, data.CodItem, data.CodTipoItem, data.IDEmpenho, data.CodItem, data.CodTipoItem).
			Scan(&allItensEmpenho[i]).Error
		if err != nil {
			return &[]ItensEmpenho{}, err
		}
	}

	return &allItensEmpenho, err
}
